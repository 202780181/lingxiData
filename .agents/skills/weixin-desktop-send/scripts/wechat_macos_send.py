#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parents[1]
OCR_SCRIPT = Path(__file__).with_name("ocr_text.swift")
WINDOW_INFO_SCRIPT = Path(__file__).with_name("window_info.swift")
DEFAULT_BUNDLE_ID = "com.tencent.xinWeChat"
DEFAULT_APP_NAME = "WeChat"


class WeChatAutomationError(RuntimeError):
    pass


@dataclass
class StepResult:
    status: str
    step: str
    message: str
    evidence: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "step": self.step,
            "message": self.message,
            "evidence": self.evidence,
        }


@dataclass
class FrontWindow:
    name: str | None
    position: tuple[int, int] | None
    size: tuple[int, int] | None

    @property
    def bounds(self) -> tuple[int, int, int, int] | None:
        if not self.position or not self.size:
            return None
        x, y = self.position
        width, height = self.size
        return x, y, width, height


class WeChatMacOSHelper:
    def __init__(self, bundle_id: str = DEFAULT_BUNDLE_ID, app_name: str = DEFAULT_APP_NAME) -> None:
        self.bundle_id = bundle_id
        self.app_name = app_name
        self.artifacts_dir = Path(tempfile.gettempdir()) / "wechat-macos-send"
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self._clipboard_text: str | None = None

    def run(
        self,
        args: list[str],
        *,
        input_text: str | None = None,
        check: bool = True,
        timeout: float = 15,
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            args,
            input=input_text,
            text=True,
            capture_output=True,
            check=check,
            timeout=timeout,
        )

    def osascript(self, script: str, *, check: bool = True, timeout: float = 15) -> str:
        command = ["osascript"]
        for line in script.splitlines():
            if line.strip():
                command.extend(["-e", line])
        result = self.run(command, check=check, timeout=timeout)
        return result.stdout.strip()

    def command_exists(self, name: str) -> bool:
        return shutil.which(name) is not None

    def is_running(self) -> bool:
        script = textwrap.dedent(
            f"""
            tell application "System Events"
                return (exists process "{self.app_name}") as text
            end tell
            """
        )
        return self.osascript(script).lower() == "true"

    def activate_wechat(self) -> StepResult:
        self.run(["open", "-b", self.bundle_id], timeout=15)
        script = textwrap.dedent(
            f"""
            tell application id "{self.bundle_id}" to activate
            tell application "System Events"
                if exists process "{self.app_name}" then
                    tell process "{self.app_name}" to set frontmost to true
                end if
            end tell
            """
        )
        self.osascript(script)
        time.sleep(0.5)
        if not self.is_running():
            return StepResult("blocked", "activate", "WeChat is not running after activation attempt.")
        return StepResult("verified", "activate", "WeChat is running and activation was requested.")

    def get_front_window(self) -> FrontWindow:
        script = textwrap.dedent(
            f"""
            tell application "System Events"
                if not (exists process "{self.app_name}") then return ""
                tell process "{self.app_name}"
                    set winCount to count of windows
                    if winCount is 0 then return ""
                    set winName to ""
                    set winPos to ""
                    set winSize to ""
                    try
                        set winName to name of front window
                    end try
                    try
                        set winPos to (position of front window) as text
                    end try
                    try
                        set winSize to (size of front window) as text
                    end try
                    return winName & "||" & winPos & "||" & winSize
                end tell
            end tell
            """
        )
        raw = self.osascript(script, check=False)
        if not raw:
            return self._swift_window_fallback()

        name, pos_raw, size_raw = (raw.split("||") + ["", "", ""])[:3]
        position = self._parse_pair(pos_raw)
        size = self._parse_pair(size_raw)
        if not position or not size:
            return self._swift_window_fallback(default_name=name or None)
        return FrontWindow(name=name or None, position=position, size=size)

    def _swift_window_fallback(self, default_name: str | None = None) -> FrontWindow:
        if not WINDOW_INFO_SCRIPT.exists():
            return FrontWindow(name=default_name, position=None, size=None)

        swift = shutil.which("xcrun") or shutil.which("swift")
        if not swift:
            return FrontWindow(name=default_name, position=None, size=None)

        if Path(swift).name == "xcrun":
            args = [swift, "swift", str(WINDOW_INFO_SCRIPT), self.app_name]
        else:
            args = [swift, str(WINDOW_INFO_SCRIPT), self.app_name]

        result = self.run(args, timeout=20, check=False)
        if not result.stdout.strip():
            return FrontWindow(name=default_name, position=None, size=None)

        try:
            payload = json.loads(result.stdout)
        except json.JSONDecodeError:
            return FrontWindow(name=default_name, position=None, size=None)

        windows = payload.get("windows") or []
        if not windows:
            return FrontWindow(name=default_name, position=None, size=None)

        top = windows[0]
        name = top.get("name") or default_name
        position = (int(top["x"]), int(top["y"]))
        size = (int(top["width"]), int(top["height"]))
        return FrontWindow(name=name, position=position, size=size)

    def _parse_pair(self, raw: str) -> tuple[int, int] | None:
        parts = [part.strip() for part in raw.split(",")]
        if len(parts) != 2:
            return None
        try:
            return int(parts[0]), int(parts[1])
        except ValueError:
            return None

    def preserve_clipboard(self) -> None:
        if self._clipboard_text is None:
            result = self.run(["pbpaste"], check=False)
            self._clipboard_text = result.stdout

    def restore_clipboard(self) -> None:
        if self._clipboard_text is not None:
            self.run(["pbcopy"], input_text=self._clipboard_text, check=False)
            self._clipboard_text = None

    def set_clipboard(self, text: str) -> None:
        self.run(["pbcopy"], input_text=text, timeout=5)

    def keystroke(self, key: str, using: list[str] | None = None) -> None:
        modifiers = "{" + ", ".join(f"{item} down" for item in (using or [])) + "}" if using else ""
        if modifiers:
            script = textwrap.dedent(
                f"""
                tell application "System Events"
                    keystroke "{key}" using {modifiers}
                end tell
                """
            )
        else:
            script = textwrap.dedent(
                f"""
                tell application "System Events"
                    keystroke "{key}"
                end tell
                """
            )
        self.osascript(script)

    def key_code(self, code: int, using: list[str] | None = None) -> None:
        modifiers = "{" + ", ".join(f"{item} down" for item in (using or [])) + "}" if using else ""
        if modifiers:
            script = textwrap.dedent(
                f"""
                tell application "System Events"
                    key code {code} using {modifiers}
                end tell
                """
            )
        else:
            script = textwrap.dedent(
                f"""
                tell application "System Events"
                    key code {code}
                end tell
                """
            )
        self.osascript(script)

    def focus_search(self) -> StepResult:
        self.keystroke("f", using=["command"])
        time.sleep(0.25)
        return StepResult("verified", "focus_search", "Sent Cmd+F to WeChat.")

    def clear_focused_field(self) -> None:
        self.keystroke("a", using=["command"])
        time.sleep(0.1)
        self.key_code(51)
        time.sleep(0.1)

    def paste_from_clipboard(self) -> None:
        self.keystroke("v", using=["command"])
        time.sleep(0.25)

    def press_return(self) -> None:
        self.key_code(36)
        time.sleep(0.3)

    def search_recipient(self, recipient: str) -> StepResult:
        self.focus_search()
        self.clear_focused_field()
        self.set_clipboard(recipient)
        self.paste_from_clipboard()
        time.sleep(0.35)
        self.press_return()
        time.sleep(0.6)
        return StepResult("verified", "search_recipient", f"Submitted WeChat search for {recipient!r}.")

    def capture_region(
        self,
        label: str,
        region: tuple[int, int, int, int],
    ) -> StepResult:
        x, y, width, height = region
        if width <= 0 or height <= 0:
            return StepResult("blocked", "capture", "Invalid capture region.", {"region": region})

        path = self.artifacts_dir / f"{int(time.time() * 1000)}-{label}.png"
        try:
            self.run(
                [
                    "screencapture",
                    "-x",
                    "-R",
                    f"{x},{y},{width},{height}",
                    str(path),
                ],
                timeout=10,
            )
        except subprocess.CalledProcessError as exc:
            error = exc.stderr.strip() or exc.stdout.strip() or "screencapture failed"
            return StepResult(
                "blocked",
                "capture",
                "Unable to capture the screen. Check macOS Screen Recording permission.",
                {"error": error},
            )
        return StepResult("verified", "capture", "Captured evidence image.", {"path": str(path)})

    def ocr_image(self, image_path: str) -> StepResult:
        if not OCR_SCRIPT.exists():
            return StepResult("blocked", "ocr", "OCR script is missing.")

        swift = shutil.which("xcrun") or shutil.which("swift")
        if not swift:
            return StepResult("blocked", "ocr", "Swift is unavailable, so OCR cannot run.")

        if Path(swift).name == "xcrun":
            args = [swift, "swift", str(OCR_SCRIPT), image_path]
        else:
            args = [swift, str(OCR_SCRIPT), image_path]

        try:
            result = self.run(args, timeout=25, check=False)
        except subprocess.TimeoutExpired:
            return StepResult("blocked", "ocr", "OCR timed out.")

        raw = result.stdout.strip()
        if not raw:
            return StepResult("blocked", "ocr", "OCR returned no output.", {"stderr": result.stderr.strip()})

        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            return StepResult("blocked", "ocr", "OCR returned invalid JSON.", {"raw": raw})

        if not payload.get("ok"):
            return StepResult(
                "blocked",
                "ocr",
                "OCR failed.",
                {"error": payload.get("error"), "path": image_path},
            )

        return StepResult(
            "verified",
            "ocr",
            "OCR extracted text from the screenshot.",
            {"path": image_path, "text": payload.get("text", "")},
        )

    def window_regions(self) -> dict[str, tuple[int, int, int, int]] | None:
        window = self.get_front_window()
        bounds = window.bounds
        if not bounds:
            return None

        x, y, width, height = bounds
        search_x = x + int(width * 0.02)
        search_y = y + int(height * 0.08)
        search_w = int(width * 0.30)
        search_h = int(height * 0.18)

        header_x = x + int(width * 0.26)
        header_y = y + int(height * 0.02)
        header_w = int(width * 0.70)
        header_h = int(height * 0.14)

        composer_x = x + int(width * 0.26)
        composer_y = y + int(height * 0.78)
        composer_w = int(width * 0.70)
        composer_h = int(height * 0.16)

        return {
            "search": (search_x, search_y, search_w, search_h),
            "header": (header_x, header_y, header_w, header_h),
            "composer": (composer_x, composer_y, composer_w, composer_h),
            "window": (x, y, width, height),
        }

    def verify_target(self, recipient: str) -> StepResult:
        regions = self.window_regions()
        if not regions:
            return StepResult("blocked", "verify_target", "WeChat front window is unavailable.")

        capture = self.capture_region("header", regions["header"])
        if capture.status != "verified":
            return StepResult(
                "ambiguous",
                "verify_target",
                "Target verification is unavailable because screenshot capture failed.",
                capture.evidence,
            )

        ocr = self.ocr_image(capture.evidence["path"])
        if ocr.status != "verified":
            return StepResult("ambiguous", "verify_target", "Target verification is unavailable because OCR failed.", ocr.evidence)

        text = ocr.evidence.get("text", "")
        if recipient in text:
            return StepResult("verified", "verify_target", f"Verified chat header contains {recipient!r}.", ocr.evidence)

        return StepResult(
            "ambiguous",
            "verify_target",
            "Could not confirm the current chat header matches the recipient.",
            ocr.evidence,
        )

    def focus_composer(self) -> StepResult:
        regions = self.window_regions()
        if not regions:
            return StepResult("blocked", "focus_composer", "WeChat front window is unavailable.")

        x, y, width, height = regions["composer"]
        click_x = x + width // 2
        click_y = y + height // 2

        if self.command_exists("cliclick"):
            self.run(["cliclick", f"c:{click_x},{click_y}"], timeout=10)
            time.sleep(0.25)
            return StepResult(
                "verified",
                "focus_composer",
                "Focused the composer with cliclick.",
                {"point": {"x": click_x, "y": click_y}},
            )

        try:
            import pyautogui  # type: ignore
        except ImportError:
            return StepResult(
                "ambiguous",
                "focus_composer",
                "Composer focus requires either cliclick or pyautogui for coordinate fallback.",
                {"point": {"x": click_x, "y": click_y}},
            )

        pyautogui.FAILSAFE = True
        pyautogui.click(click_x, click_y)
        time.sleep(0.25)
        return StepResult(
            "verified",
            "focus_composer",
            "Focused the composer with pyautogui.",
            {"point": {"x": click_x, "y": click_y}},
        )

    def verify_composer_text(self, message: str) -> StepResult:
        regions = self.window_regions()
        if not regions:
            return StepResult("blocked", "verify_composer_text", "WeChat front window is unavailable.")

        capture = self.capture_region("composer", regions["composer"])
        if capture.status != "verified":
            return StepResult(
                "ambiguous",
                "verify_composer_text",
                "Composer verification is unavailable because screenshot capture failed.",
                capture.evidence,
            )

        ocr = self.ocr_image(capture.evidence["path"])
        if ocr.status != "verified":
            return StepResult("ambiguous", "verify_composer_text", "Composer verification is unavailable because OCR failed.", ocr.evidence)

        text = ocr.evidence.get("text", "")
        if message in text:
            return StepResult("verified", "verify_composer_text", "Verified the composer contains the intended message.", ocr.evidence)

        return StepResult(
            "ambiguous",
            "verify_composer_text",
            "Could not confirm the composer contains the intended message.",
            ocr.evidence,
        )

    def verify_post_send(self, message: str) -> StepResult:
        regions = self.window_regions()
        if not regions:
            return StepResult("blocked", "verify_post_send", "WeChat front window is unavailable.")

        capture = self.capture_region("window", regions["window"])
        if capture.status != "verified":
            return StepResult(
                "ambiguous",
                "verify_post_send",
                "Post-send verification is unavailable because screenshot capture failed.",
                capture.evidence,
            )

        ocr = self.ocr_image(capture.evidence["path"])
        if ocr.status != "verified":
            return StepResult("ambiguous", "verify_post_send", "Post-send verification is unavailable because OCR failed.", ocr.evidence)

        text = ocr.evidence.get("text", "")
        if message in text:
            return StepResult("verified", "verify_post_send", "Verified the sent message appears in the visible conversation.", ocr.evidence)

        return StepResult(
            "ambiguous",
            "verify_post_send",
            "Could not confirm the sent message appears in the conversation.",
            ocr.evidence,
        )

    def probe(self) -> dict[str, Any]:
        window = self.get_front_window()
        screen_capture_result = self.capture_region("probe", (0, 0, 10, 10))
        screen_capture = {
            "available": screen_capture_result.status == "verified",
            "message": screen_capture_result.message,
            "evidence": screen_capture_result.evidence,
        }
        if screen_capture_result.status == "verified":
            try:
                Path(screen_capture_result.evidence["path"]).unlink()
            except OSError:
                pass

        return {
            "running": self.is_running(),
            "bundle_id": self.bundle_id,
            "window": {
                "name": window.name,
                "position": window.position,
                "size": window.size,
            },
            "screen_capture": screen_capture,
            "cliclick": self.command_exists("cliclick"),
            "pyautogui": self._pyautogui_available(),
            "artifacts_dir": str(self.artifacts_dir),
        }

    def _pyautogui_available(self) -> bool:
        try:
            import pyautogui  # type: ignore  # noqa: F401
        except ImportError:
            return False
        return True

    def send_message(
        self,
        *,
        recipient: str,
        message: str,
        dry_run: bool,
        allow_ambiguous_send: bool,
    ) -> dict[str, Any]:
        steps: list[dict[str, Any]] = []

        self.preserve_clipboard()
        try:
            activation = self.activate_wechat()
            steps.append(activation.to_dict())
            if activation.status == "blocked":
                return self._result("blocked", "Activation failed.", steps)

            search = self.search_recipient(recipient)
            steps.append(search.to_dict())

            target = self.verify_target(recipient)
            steps.append(target.to_dict())
            if target.status == "blocked":
                return self._result("blocked", "Target verification failed.", steps)
            if target.status != "verified" and not allow_ambiguous_send:
                return self._result(
                    "ambiguous",
                    "Recipient could not be verified. Re-run with --allow-ambiguous-send to continue anyway.",
                    steps,
                )

            if dry_run:
                return self._result("verified" if target.status == "verified" else "ambiguous", "Dry run complete.", steps)

            composer = self.focus_composer()
            steps.append(composer.to_dict())
            if composer.status == "blocked":
                return self._result("blocked", "Composer could not be focused.", steps)
            if composer.status != "verified" and not allow_ambiguous_send:
                return self._result(
                    "ambiguous",
                    "Composer focus could not be confirmed. Re-run with --allow-ambiguous-send to continue anyway.",
                    steps,
                )

            self.set_clipboard(message)
            self.paste_from_clipboard()
            time.sleep(0.35)

            message_ready = self.verify_composer_text(message)
            steps.append(message_ready.to_dict())
            if message_ready.status == "blocked":
                return self._result("blocked", "Message verification failed before send.", steps)
            if message_ready.status != "verified" and not allow_ambiguous_send:
                return self._result(
                    "ambiguous",
                    "Could not confirm the message text before send. Re-run with --allow-ambiguous-send to continue anyway.",
                    steps,
                )

            self.press_return()
            post_send = self.verify_post_send(message)
            steps.append(post_send.to_dict())
            if post_send.status == "verified":
                return self._result("verified", "Message send was verified.", steps)
            if allow_ambiguous_send:
                return self._result("ambiguous", "Message was sent, but post-send verification stayed ambiguous.", steps)
            return self._result(
                "ambiguous",
                "The message may have been sent, but verification was ambiguous. Re-run with --allow-ambiguous-send if you want this path.",
                steps,
            )
        finally:
            self.restore_clipboard()

    def _result(self, status: str, message: str, steps: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "status": status,
            "message": message,
            "steps": steps,
        }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="macOS WeChat desktop helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    probe = subparsers.add_parser("probe", help="Inspect local WeChat automation capabilities.")
    probe.add_argument("--json", action="store_true", help="Emit JSON.")

    send = subparsers.add_parser("send", help="Search for a recipient and send a message in WeChat.")
    send.add_argument("--recipient", required=True, help="Exact recipient name or the search string to paste.")
    send.add_argument("--message", required=True, help="Exact message body.")
    send.add_argument("--dry-run", action="store_true", help="Stop after recipient verification.")
    send.add_argument(
        "--allow-ambiguous-send",
        action="store_true",
        help="Continue even when target/message verification is ambiguous.",
    )
    send.add_argument("--json", action="store_true", help="Emit JSON.")

    return parser


def emit(payload: dict[str, Any], *, json_output: bool) -> int:
    if json_output:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(payload["message"])
        if "steps" in payload:
            for step in payload["steps"]:
                print(f"- [{step['status']}] {step['step']}: {step['message']}")
                evidence = step.get("evidence") or {}
                for key, value in evidence.items():
                    if key == "text" and isinstance(value, str):
                        preview = value.strip().replace("\n", " | ")
                        if len(preview) > 180:
                            preview = preview[:177] + "..."
                        print(f"    {key}: {preview}")
                    else:
                        print(f"    {key}: {value}")
        else:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if payload.get("status") in {"verified", "running"} else 1


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    helper = WeChatMacOSHelper()

    try:
        if args.command == "probe":
            payload = helper.probe()
            if args.json:
                print(json.dumps(payload, ensure_ascii=False, indent=2))
            else:
                print(json.dumps(payload, ensure_ascii=False, indent=2))
            return 0

        if args.command == "send":
            payload = helper.send_message(
                recipient=args.recipient,
                message=args.message,
                dry_run=args.dry_run,
                allow_ambiguous_send=args.allow_ambiguous_send,
            )
            return emit(payload, json_output=args.json)

        raise WeChatAutomationError(f"Unknown command: {args.command}")
    except (WeChatAutomationError, subprocess.SubprocessError, OSError) as exc:
        payload = {
            "status": "blocked",
            "message": str(exc),
        }
        if getattr(args, "json", False):
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        else:
            print(payload["message"], file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
