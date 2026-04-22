---
name: weixin-desktop-send
description: "Send a single text message in the macOS WeChat desktop app by controlling the native UI. Use when the user asks to send a WeChat message to a named contact or group, or asks the agent to operate the desktop WeChat client directly."
---

# WeChat Desktop Send

Use this skill for **desktop WeChat GUI automation on macOS**, not for protocol bots or backend send APIs.

This skill is appropriate when the user wants the agent to act like a human:
- open or focus WeChat
- search for a contact or group
- open the chat
- send one exact text message

Prefer the `Computer Use` app tools when they are available. Treat the WeChat client as the source of truth.

This skill now has a local helper implementation:

- [README](./README.md)
- [macOS helper](./scripts/wechat_macos_send.py)
- [OCR helper](./scripts/ocr_text.swift)

## Preferred Execution Order

Use these layers in order:

1. `Computer Use` / accessibility tree when the WeChat window is inspectable
2. `osascript` + `System Events` for app activation, shortcuts, and search flow
3. Coordinate click fallback only for composer focus

Do not jump straight to coordinate clicking if the higher layers are still viable.

## Fast Path For This Machine

The current machine has a verified faster path for WeChat:

1. Target the app by bundle id `com.tencent.xinWeChat`.
2. Focus search with `Cmd+F` instead of trying to click the search box.
3. Prefer clipboard paste for Chinese recipient names or mixed Chinese text.
4. Open the top search result with `Return`.
5. Prefer screenshot + OCR verification when Screen Recording permission is available.
6. Use coordinate fallback only to focus the composer if accessibility cannot reach it.
7. Send with `Return`.

Use this fast path first unless the UI clearly changed.

## Preconditions

- The user explicitly asked to send a message.
- The message body is available verbatim, or it is safe to ask for it.
- macOS WeChat is installed and logged in.
- Default to **one recipient, one message**.

Do not use this skill for:
- mass messaging
- spam or growth-hacking blasts
- hidden background sending
- sending a rewritten message that the user did not authorize

## Inputs

- `recipient`: contact name, remark, or group name
- `message`: exact text to send

If the recipient or message is missing, ask only for the missing field.

## Workflow

1. Start with a fresh app snapshot of WeChat.
2. If `Computer Use` can inspect the window, use it first.
3. If the content tree is unavailable or the screenshot is black, switch to the local helper:

```bash
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py probe
```

4. Launch or focus WeChat by bundle id `com.tencent.xinWeChat`.
5. Use `Cmd+F` to focus search.
6. Clear any previous search text.
7. Enter the recipient using the most reliable method:
   - exact text if it types correctly
   - otherwise clipboard paste
   - otherwise full pinyin if the direct Chinese string does not behave well
8. Open the best matching chat with `Return`.
9. Verify the chat header matches the intended recipient before typing the message.
10. Focus the message composer.
11. Enter the exact user-provided message using clipboard paste for Chinese or mixed Chinese text.
12. Send the message with `Return`.
13. Verify that the sent message appears in the conversation or that OCR evidence supports the send.
14. Report success only after verification.

## Permission Gate

Before every verification step, get a fresh WeChat app snapshot.

If Computer Use reports that approval was denied or WeChat cannot be inspected because app-control permission is missing:
- do not continue blind
- do not claim the message was sent or verified
- ask the user to re-authorize Codex/Computer Use for WeChat, then retry from a fresh WeChat snapshot

If the helper reports screen capture failure:
- do not treat OCR verification as available
- tell the user to re-enable macOS `System Settings > Privacy & Security > Screen Recording` for the terminal or app that is running the helper
- keep the run in `ambiguous` or `blocked` state unless the user explicitly wants `--allow-ambiguous-send`

If a permission prompt is visible, tell the user to approve it. If no prompt appears, direct the user to re-enable WeChat access in Codex app permissions and macOS `System Settings > Privacy & Security > Accessibility` and `Screen Recording` for Codex, then retry.

## Search And Disambiguation

- If search returns multiple plausible matches, stop and ask the user which one they want.
- If the result looks like a public account, Mini Program, or wrong group, do not continue.
- If search opens a recent conversation automatically, still verify the chat title before sending.

## Input Strategy

Prefer this order:

1. Use accessible settable fields when available.
2. Use keyboard shortcuts for stable entry points such as `Cmd+F`.
3. Use clipboard paste for recipient and message when Chinese input is involved.
4. Use coordinate clicking only to focus the composer when the higher layers cannot do it.

Observed on this machine:

- Clicking the WeChat search box may fail with an accessibility `AXError.notImplemented`.
- Direct `type_text` may drop Chinese characters in WeChat search and composer.
- Clipboard paste is reliable for the final Chinese message body.
- `Computer Use` may expose the outer window while returning a black screenshot for the content layer.
- `screencapture` may fail when Screen Recording permission is missing.

Before sending:
- ensure the cursor is in the composer, not the search box
- ensure the intended message is in the composer
- avoid pressing `Return` until the chat target is verified or the user explicitly accepts `ambiguous`

## Verification Rules

Never claim success just because a click happened.

Success requires one of:
- the new outgoing bubble with the exact text is visible
- the conversation clearly shows the message was appended after send
- the helper captured OCR evidence that includes the intended message after send

If verification is ambiguous:
- say that send status could not be confirmed
- include what happened
- do not overclaim
- require explicit user approval before using `--allow-ambiguous-send`

## Failure Handling

Stop and report clearly if:
- WeChat is not logged in
- Computer Use permission for WeChat is denied and the user has not re-authorized it
- the search box cannot be found
- the target chat cannot be uniquely identified
- the message composer cannot be focused
- a modal, update prompt, or permission dialog blocks the flow
- Screen Recording is unavailable and the run requires OCR verification

If accessibility data is weak, fall back to the helper's keyboard flow first, then coordinate focus for the composer, but keep the same verification rules.

## Safety Rules

- Send only the exact message requested by the user.
- Do not improvise content for the user.
- Do not send to multiple chats in one run unless the user explicitly requested it.
- If the action looks risky or socially sensitive, pause for confirmation before the final send.

## Local Helper Usage

Probe the machine first:

```bash
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py probe
```

Dry-run a send flow without pressing `Return` on the final message:

```bash
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py send \
  --recipient "文件传输助手" \
  --message "这是第二条成功的信息" \
  --dry-run
```

Only continue with the helper's ambiguous path when the user explicitly approves it:

```bash
python3 .agents/skills/weixin-desktop-send/scripts/wechat_macos_send.py send \
  --recipient "文件传输助手" \
  --message "这是第二条成功的信息" \
  --allow-ambiguous-send
```

## Output

Return a short result:

- success: recipient and confirmation that the message was sent
- blocked: why it stopped
- ambiguous: what was attempted and what could not be verified

## Example Triggers

- `给老曹发微信，内容是“你好，早上好”`
- `帮我给产品群发一句：今晚九点前提交周报`
- `在微信里给张三发一条消息，说我十分钟后到`
