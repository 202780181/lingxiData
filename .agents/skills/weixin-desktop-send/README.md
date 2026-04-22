# WeChat macOS Helper

This skill now includes a local helper for macOS WeChat automation:

- `scripts/wechat_macos_send.py`
- `scripts/ocr_text.swift`
- `scripts/window_info.swift`

Design goals:

1. Accessibility and keyboard flow first
2. `osascript` / `System Events` fallback for app focus and shortcuts
3. Coordinate click fallback only for composer focus

The helper is intentionally strict:

- it tries to verify the target chat and message with screenshot + OCR
- if verification is ambiguous, it stops unless `--allow-ambiguous-send` is passed
- it restores the clipboard after each run

Examples:

```bash
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py probe
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py send \
  --recipient "文件传输助手" \
  --message "这是第二条成功的信息" \
  --dry-run
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py send \
  --recipient "文件传输助手" \
  --message "这是第二条成功的信息" \
  --allow-ambiguous-send
```

Notes:

- Screen capture and OCR verification require macOS Screen Recording permission.
- If `cliclick` is unavailable, the helper can use `pyautogui` for the coordinate fallback.
- Evidence images are written to the system temp directory under `wechat-macos-send/`.
