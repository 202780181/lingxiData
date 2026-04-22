# 用户端前端 AI Handoff - Platform Foundation, Publish Loop, Dashboard V1

## 1. 文档目的

这份文档只给用户端前端 AI 辅助工程师使用。它不是产品 PRD，也不是后端源码说明，而是一个用户端前端实现交接文档：

- 说明当前系统底座已经有哪些能力。
- 说明前端应该实现哪些页面和用户流程。
- 说明每个模块要调用哪些接口。
- 说明接口响应如何判断状态。
- 明确哪些能力还没有后端支持，前端不要硬写假功能。
- 明确管理端和 worker 内部接口不属于本文范围。

当前前端优先级建议：

1. 登录、注册、找回密码、工作区初始化。
2. 小红书账号绑定和账号列表。
3. Dashboard V1 数据大屏。
4. 发布中心任务列表、详情、取消、重试。
5. 套餐/用量/团队管理的基础页面。

## 2. 全局接口规则

### 2.1 Base URL

用户端 API 前缀：

```text
/api/v1/app
```

本文不列管理端和 worker 内部协议接口。用户端前端只应该调用 `/api/v1/app`。管理端页面和 worker 内部协议要分别写独立文档，不要混在用户端实现里。

### 2.2 标准响应 envelope

所有 `xhs-main` API 返回统一结构：

```json
{
  "code": "OK",
  "message": "xhs dashboard overview ready",
  "data": {}
}
```

前端判断成功：

- 应优先判断 HTTP 2xx 和 `body.code === "OK"`。
- 不要把 `message` 当作业务状态。
- 业务状态全部看 `data` 里的字段，比如 `dashboard_state`、`available_actions`、`execution_stage`。

常见错误 `code`：

- `UNAUTHORIZED`：未登录或会话失效。
- `WORKSPACE_ONBOARDING_REQUIRED`：用户还没有工作区。
- `FEATURE_NOT_ENABLED`：当前套餐没有功能。
- `QUOTA_EXCEEDED`：用量超限。
- `ACCOUNT_NOT_FOUND`：账号不存在或不属于当前租户。
- `INVALID_REQUEST`：参数错误。

### 2.3 Cookie 会话

登录成功后后端通过 cookie 维护会话：

- session cookie：`xhs_main_session`
- refresh cookie：`xhs_main_refresh`

前端请求需要带 cookie，例如 `fetch` 要设置：

```ts
credentials: "include"
```

### 2.4 前端状态判断原则

不要在前端复制复杂业务规则。后端已经返回这些字段：

- `onboarding_required`
- `enabled_features`
- `quota_limits`
- `available_actions`
- `dashboard_state`
- `data_state`
- `execution_stage`

前端只负责按这些字段渲染 UI。

## 3. 当前系统能力总览

### 3.1 三类账号必须区分

系统里有三类账号，前端命名和页面文案不要混用：

- 用户账号：用户用邮箱/密码登录用户端。
- 管理员账号：平台管理端账号，用于管理租户、套餐、worker 等。
- 小红书账号：用户在工作区绑定的业务账号，对应一个隔离的 worker runtime。

### 3.2 P1-P4 平台底座已经具备的能力

当前底座已经覆盖：

- 用户注册、邮箱验证码、登录、登出。
- 登录验证码和登录风控。
- refresh session。
- 找回密码。
- 工作区创建和当前工作区上下文。
- 套餐、权益、配额、用量。
- 团队成员管理。
- 小红书账号绑定。
- tenant worker provisioning、register、heartbeat、claim-next。
- worker job attempt heartbeat、complete、fail。
- worker lease expiry 回收。
- publish dispatch、retry、cancel、result 回收。
- Dashboard 手动同步 job 闭环。

前端不需要理解 worker 内部协议细节，只需要知道：小红书账号绑定、发布任务和 Dashboard 同步都是由后端编排 worker 完成。

### 3.3 P5 已具备的能力

P5 当前完成的是“发布执行闭环”：

- 创建发布记录。
- 后端创建 job 和用量 reservation。
- worker claim 后执行发布。
- worker 成功/失败/登录失效/租约过期/取消都会回写状态。
- 发布列表和详情能展示执行阶段、错误、重试、取消、发布结果。
- 前端可以根据 `available_actions` 渲染取消/重试按钮。

### 3.4 Dashboard V1 当前具备的能力

Dashboard V1 当前完成的是“后端可用闭环”：

- 账号选择列表。
- 汇总/单账号 overview。
- today vs yesterday 的核心指标。
- 手动触发同步。
- worker 采集当前登录小红书账号主页资料、互动数据、主页笔记列表。
- 后端把 worker 结果入库为快照。
- 前端可读取快照渲染数据大屏。

还没有：

- 前端页面。
- 自动定时同步。
- 长周期趋势图接口。
- 单篇笔记列表/排行接口。
- 竞品监控接口。
- 评论分析接口。
- 官方后台曝光/阅读/转化数据。

## 4. 用户端建议页面结构

### 4.1 未登录区

建议页面：

- 登录页
- 注册页
- 找回密码页

### 4.2 登录后工作区

建议页面：

- 工作区初始化页
- 首页 Dashboard
- 小红书账号管理页
- 发布中心
- 套餐/用量页
- 团队成员页

### 4.3 不在本文范围

以下内容不放在用户端前端实现文档里：

- 管理员账号登录。
- 租户套餐覆盖。
- 租户 worker 管理。
- 平台管理后台页面。

如果要实现管理端，需要单独写管理端前端 handoff 文档。

## 5. 登录、注册、工作区初始化

### 5.1 获取图形验证码

```text
GET /api/v1/app/auth/captcha
```

`data`：

```ts
{
  token: string
  image_data_url: string
  expires_at: string
}
```

前端行为：

- 登录页加载时请求。
- 展示 `image_data_url`。
- 登录提交时带上 `token` 和用户输入的验证码答案。

### 5.2 请求注册邮箱验证码

```text
POST /api/v1/app/auth/register/email-code
```

body：

```json
{
  "email": "user@example.com"
}
```

前端行为：

- 成功后进入倒计时，使用 `cooldown_seconds`。
- 开发环境可能返回 `debug_code`，生产环境不要依赖。

### 5.3 注册

```text
POST /api/v1/app/auth/register
```

body：

```json
{
  "email": "user@example.com",
  "name": "User",
  "password": "secret",
  "email_verification_code": "123456"
}
```

成功后可以引导用户登录，或根据产品选择自动登录。当前后端注册接口返回注册用户信息，不等于登录态。

### 5.4 找回密码

请求找回密码邮箱验证码：

```text
POST /api/v1/app/auth/password-reset/email-code
```

body：

```json
{
  "email": "user@example.com"
}
```

重置密码：

```text
POST /api/v1/app/auth/password-reset
```

body：

```json
{
  "email": "user@example.com",
  "new_password": "new-secret",
  "email_verification_code": "123456"
}
```

前端行为：

- 找回密码验证码和注册验证码是两个独立流程，不要复用注册验证码接口。
- 重置成功后跳转登录页，并要求用户用新密码登录。
- 开发环境可能返回 `debug_code`，生产环境不要依赖。

### 5.5 登录

```text
POST /api/v1/app/auth/login
```

body：

```json
{
  "email": "user@example.com",
  "password": "secret",
  "image_captcha_token": "captcha-token",
  "image_captcha_answer": "abcd"
}
```

`data.session`：

```ts
{
  session_id: string
  user_id: string
  email: string
  name: string
  onboarding_required: boolean
  active_tenant_id: string | null
  active_role: "owner" | "member" | null
  platform_roles: string[]
}
```

前端行为：

- 登录成功后后端设置 cookie。
- 如果 `onboarding_required === true`，跳转工作区创建页。
- 否则进入 Dashboard。
### 5.6 当前登录用户

```text
GET /api/v1/app/auth/me
```

前端行为：

- App 启动时调用。
- `UNAUTHORIZED` 跳登录页。
- `onboarding_required` 跳工作区创建页。

### 5.7 创建工作区

```text
POST /api/v1/app/onboarding/workspace
```

body：

```json
{
  "name": "Team Alpha",
  "slug": "team-alpha"
}
```

`slug` 可不传，后端会生成。

前端行为：

- 创建成功后刷新 `auth/me` 或直接进入 Dashboard。

## 6. 权益、用量、动作闸门

### 6.1 当前工作区权益

```text
GET /api/v1/app/workspace/entitlements
```

`data`：

```ts
{
  plan_code: string
  plan_name: string
  enabled_features: string[]
  quota_limits: { quota_key: string; limit: number | null }[]
  subscription_status: string | null
}
```

前端行为：

- 用 `enabled_features` 控制菜单可见性或禁用态。
- 不要在前端硬编码套餐判断。

当前常见 feature：

- `xhs_account_connect`
- `xhs_publish`
- `workspace_member_management`
- `report_export`
- `ai_content_generation`

### 6.2 当前工作区用量

```text
GET /api/v1/app/workspace/usage
```

`data.items[]`：

```ts
{
  usage_key: string
  period: string
  limit: number | null
  used: number
  reserved: number
  remaining: number | null
  period_start: string
  period_end: string
}
```

前端行为：

- 展示套餐用量。
- `remaining === null` 表示不限量。
- `reserved` 表示已占用但尚未结算的任务，例如发布任务进行中。

### 6.3 动作闸门

接口：

```text
POST /api/v1/app/workspace/action-gates/xhs-publish
POST /api/v1/app/workspace/action-gates/report-export
POST /api/v1/app/workspace/action-gates/ai-content-generation
```

前端通常不需要主动调用这些接口，除非某个按钮是纯动作消耗。发布创建接口已经会处理发布相关 reservation。

## 7. 小红书账号管理

### 7.1 账号列表

```text
GET /api/v1/app/workspace/accounts
```

`data.items[]`：

```ts
{
  account_id: string
  tenant_id: string
  platform: string
  external_account_id: string
  display_name: string
  status: "active" | "disabled" | "archived"
  auth_state: "unknown" | "authenticated" | "login_required" | "expired"
  worker_id: string | null
  created_at: string | null
  updated_at: string | null
}
```

### 7.2 传统创建账号

```text
POST /api/v1/app/workspace/accounts
```

body：

```json
{
  "external_account_id": "xhs-id",
  "display_name": "Brand A",
  "platform": "xiaohongshu"
}
```

注意：这只是账号记录创建，不是扫码登录绑定。用户端新增小红书账号应优先使用下一节的绑定接口。

### 7.3 开始小红书账号绑定

```text
POST /api/v1/app/workspace/xhs-accounts/login-sessions
```

body：

```json
{
  "display_name": "Brand A",
  "platform": "xiaohongshu"
}
```

`data`：

```ts
{
  account: AccountView
  worker_id: string
  qrcode: {
    timeout: string
    is_logged_in: boolean
    image: string | null
  }
}
```

前端行为：

- 展示 `qrcode.image`，它是 data URL/base64 图片。
- 如果 `qrcode.is_logged_in === true`，可以直接进入已绑定态。
- 否则轮询登录状态接口。

### 7.4 轮询小红书账号登录状态

```text
GET /api/v1/app/workspace/xhs-accounts/{account_id}/login-status
```

`data`：

```ts
{
  account: AccountView
  worker_id: string | null
  is_logged_in: boolean
  username: string | null
}
```

前端行为：

- 每 2-5 秒轮询一次。
- `is_logged_in === true` 后停止轮询，提示绑定成功，刷新账号列表。
- 如果长时间未成功，显示“二维码可能过期，请重新获取”。

## 8. Dashboard V1

### 8.1 页面目标

Dashboard 当前只做第一版数据大屏，不做复杂图表：

- 默认展示全部已绑定小红书账号的汇总。
- 支持切换到单个账号。
- 展示今天相对昨天的核心指标。
- 支持用户手动触发同步。
- 能处理无账号、无数据、同步中、同步失败、登录失效等状态。

### 8.2 Dashboard 账号选择列表

```text
GET /api/v1/app/workspace/dashboard/xhs-accounts
```

`data`：

```ts
{
  items: {
    account_id: string
    display_name: string
    platform: string
    status: string
    auth_state: string
    worker_id: string | null
    avatar_url: string | null
    nickname: string | null
    profile_url: string | null
    last_synced_at: string | null
    has_metrics: boolean
    data_state: "ready" | "no_data" | "login_required" | "sync_failed" | "unknown"
  }[]
}
```

前端行为：

- 自己额外插入“全部账号”选项，不要期待后端返回。
- 每个账号选项可以展示 `nickname || display_name`。
- 用 `data_state` 展示小标签：
  - `ready`：有数据。
  - `no_data`：未采集。
  - `login_required`：需要重新登录。
  - `sync_failed`：最近同步失败。
  - `unknown`：状态未知。

### 8.3 Dashboard 概览

全部账号：

```text
GET /api/v1/app/workspace/dashboard/xhs-overview
```

单账号：

```text
GET /api/v1/app/workspace/dashboard/xhs-overview?account_id=account_1
```

`data`：

```ts
{
  dashboard_state:
    | "ready"
    | "no_accounts"
    | "no_data"
    | "sync_pending"
    | "partial_data"
    | "login_required"
    | "sync_failed"
  scope: {
    scope_type: "all_accounts" | "single_account"
    account_id: string | null
  }
  summary: {
    followers_total: number | null
    followers_delta: number | null
    likes_total: number | null
    likes_delta: number | null
    collects_total: number | null
    collects_delta: number | null
    comments_total: number | null
    comments_delta: number | null
  } | null
  comparison: {
    current_date: string
    previous_date: string
    timezone: string
  }
  available_actions: string[]
  generated_at: string
  last_synced_at: string | null
  account_count: number
  accounts_with_data_count: number
  accounts_requiring_login_count: number
}
```

前端渲染建议：

- `dashboard_state === "no_accounts"`：展示绑定账号空状态，按钮跳小红书账号绑定流程。
- `dashboard_state === "no_data"`：展示无数据状态，给“同步数据”按钮。
- `dashboard_state === "sync_pending"`：展示同步中/等待 worker。
- `dashboard_state === "partial_data"`：展示现有数据，同时提示部分账号无数据或需登录。
- `dashboard_state === "login_required"`：展示重新登录提示。
- `dashboard_state === "sync_failed"`：展示同步失败提示，可提供重试同步按钮。
- `dashboard_state === "ready"`：正常展示指标卡片。

指标卡片：

- 粉丝数：`followers_total`，变化 `followers_delta`。
- 点赞数：`likes_total`，变化 `likes_delta`。
- 收藏数：`collects_total`，变化 `collects_delta`。
- 评论数：`comments_total`，变化 `comments_delta`。

注意：

- `delta === null` 表示没有昨天基线，不要显示 `+0`。
- `summary === null` 只会在无账号等无法计算的状态出现。

### 8.4 手动触发 Dashboard 同步

```text
POST /api/v1/app/workspace/dashboard/xhs-sync-runs
```

同步全部账号：

```json
{
  "account_id": null
}
```

同步单个账号：

```json
{
  "account_id": "account_1"
}
```

`data`：

```ts
{
  items: {
    sync_run_id: string
    account_id: string
    job_id: string
    status: "pending" | "running" | "succeeded" | "failed" | "canceled"
    created_at: string | null
    updated_at: string | null
  }[]
}
```

前端行为：

- 点击“同步数据”后调用。
- 成功后可以立即刷新 overview。
- 因为当前没有独立“同步状态查询接口”，建议前端短时间轮询 overview 和账号选择列表。
- 当 overview 从 `sync_pending` 变成 `ready`、`partial_data` 或 `sync_failed` 时停止轮询。

### 8.5 Dashboard 当前数据来源限制

当前 worker 能采集：

- 当前登录账号主页资料。
- 关注数、粉丝数、获赞与收藏数。
- 主页笔记列表。
- 笔记点赞、收藏、评论、分享计数。

当前不能稳定提供：

- 官方后台曝光量。
- 阅读量/浏览量。
- 主页访客。
- 粉丝画像。
- 私信。
- 商品成交/转化。
- 投流数据。
- 长历史趋势。

前端不要展示这些未支持指标，除非明确标为“暂未接入”。

## 9. 发布中心 P5

### 9.1 创建发布记录

```text
POST /api/v1/app/workspace/publish-records
```

body：

```json
{
  "account_id": "account_1",
  "title": "标题",
  "content": "正文",
  "image_urls": ["https://example.com/1.jpg"],
  "tags": ["tag1"],
  "products": [],
  "schedule_at": null,
  "is_original": true,
  "visibility": "public",
  "requested_worker_id": null
}
```

返回 `data.record` 和 `data.usage`。

前端行为：

- 创建成功后进入发布中心详情或列表。
- 展示 `usage` 用量变化。
- 如果失败是 `QUOTA_EXCEEDED`，展示用量不足。
- 如果失败是 `FEATURE_NOT_ENABLED`，提示套餐不支持。

### 9.2 发布记录列表

```text
GET /api/v1/app/workspace/publish-records
```

`data.items[]` 关键字段：

```ts
{
  publish_record_id: string
  account_id: string
  title: string
  status: string
  status_message: string | null
  failure_code: string | null
  external_post_id: string | null
  external_post_url: string | null
  published_at: string | null
  failed_at: string | null
  execution_stage: string
  last_error_code: string | null
  attempt_count: number
  available_actions: string[]
  visibility: string
  image_count: number
  requested_worker_id: string | null
  schedule_at: string | null
  created_at: string | null
  updated_at: string | null
}
```

前端行为：

- 用 `execution_stage` 渲染任务状态，不要只看 `status`。
- 用 `available_actions` 决定是否展示取消/重试按钮。

### 9.3 发布详情

```text
GET /api/v1/app/workspace/publish-records/{publish_record_id}
```

详情比列表多：

- 完整正文、图片、标签、商品。
- `execution` 对象。
- `execution.attempts` 历史。

`execution`：

```ts
{
  job_id: string | null
  job_status: string | null
  execution_stage: string
  target_worker_id: string | null
  attempt_count: number
  last_attempt_status: string | null
  last_worker_id: string | null
  last_error_code: string | null
  last_error_message: string | null
  next_retry_at: string | null
  lease_expires_at: string | null
  completed_at: string | null
  result_json: Record<string, unknown> | null
  attempts: PublishExecutionAttemptView[]
}
```

发布阶段建议文案：

- `pending_dispatch`：等待调度。
- `dispatching`：worker 执行中。
- `retry_scheduled`：失败后等待重试。
- `login_required`：小红书账号需要重新登录。
- `published`：发布成功。
- `failed`：发布失败。
- `canceled`：已取消。

具体以后端返回为准，未识别值展示原始值或通用“处理中/未知状态”。

### 9.4 取消发布

```text
POST /api/v1/app/workspace/publish-records/{publish_record_id}/cancel
```

前端行为：

- 只有 `available_actions` 包含 `cancel` 才展示按钮。
- 成功后刷新详情/列表。

### 9.5 重试发布

```text
POST /api/v1/app/workspace/publish-records/{publish_record_id}/retry
```

前端行为：

- 只有 `available_actions` 包含 `retry` 才展示按钮。
- 成功后刷新详情/列表。

## 10. 团队管理

团队管理当前只允许 owner 使用，并需要套餐 feature：`workspace_member_management`。

### 10.1 成员列表

```text
GET /api/v1/app/workspace/members
```

### 10.2 添加成员

```text
POST /api/v1/app/workspace/members
```

body：

```json
{
  "email": "member@example.com",
  "role": "member"
}
```

### 10.3 修改成员角色

```text
PATCH /api/v1/app/workspace/members/{membership_id}
```

body：

```json
{
  "role": "owner"
}
```

### 10.4 移除成员

```text
DELETE /api/v1/app/workspace/members/{membership_id}
```

前端行为：

- 非 owner 隐藏或禁用团队管理入口。
- 后端仍会校验，前端不能只靠 UI 控制权限。

## 11. 套餐页面

### 11.1 可选套餐

```text
GET /api/v1/app/workspace/subscription/plans
```

### 11.2 切换套餐

```text
POST /api/v1/app/workspace/subscription/change
```

body：

```json
{
  "plan_code": "pro"
}
```

当前这更像开发/内部版本的套餐能力，前端可以先做基础展示和切换，不要接真实支付。

## 12. 非用户端接口边界

用户端前端不要实现或调用以下接口：

- 管理端接口：属于独立管理后台。
- worker 内部协议接口：只允许 worker 和 main 服务之间通信。

用户端新增小红书账号必须走 `/api/v1/app/workspace/xhs-accounts/login-sessions`。不要把管理端 worker provisioning 当成用户端绑定流程。

## 13. 前端实现建议

### 13.1 API Client

建议封装统一请求函数：

```ts
type ApiResponse<T> = {
  code: string
  message: string
  data: T | null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1/app${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json()) as ApiResponse<T>
  if (!res.ok || body.code !== "OK") {
    throw Object.assign(new Error(body.message), {
      status: res.status,
      code: body.code,
      data: body.data,
    })
  }
  return body.data as T
}
```

### 13.2 App 初始化流程

推荐流程：

```text
App load
-> GET /auth/me
-> 401: login page
-> onboarding_required: workspace onboarding page
-> otherwise: dashboard
```

### 13.3 Dashboard 页面加载流程

推荐流程：

```text
Dashboard mount
-> GET /workspace/dashboard/xhs-accounts
-> GET /workspace/dashboard/xhs-overview
-> render by dashboard_state
```

切换账号：

```text
select all -> GET /workspace/dashboard/xhs-overview
select account -> GET /workspace/dashboard/xhs-overview?account_id=...
```

点击同步：

```text
POST /workspace/dashboard/xhs-sync-runs
-> refresh overview
-> short polling overview/account options until state changes
```

### 13.4 发布中心流程

推荐流程：

```text
Publish center
-> GET /workspace/publish-records
-> render rows by execution_stage and available_actions
```

创建发布：

```text
select account
-> fill title/content/images
-> POST /workspace/publish-records
-> navigate detail
```

详情页：

```text
GET /workspace/publish-records/{id}
-> render execution timeline from execution.attempts
```

按钮：

- `available_actions.includes("cancel")`：显示取消。
- `available_actions.includes("retry")`：显示重试。

### 13.5 路由守卫和错误页

建议前端把守卫拆成三层：

- Auth guard：调用 `GET /auth/me`，未登录跳登录页。
- Workspace guard：`onboarding_required === true` 时跳工作区初始化页。
- Feature/role guard：读取 `GET /workspace/entitlements` 和 `auth/me.active_role`，控制套餐能力、owner-only 页面、入口禁用态。

错误处理建议：

- `UNAUTHORIZED`：清理本地用户态，跳登录。
- `WORKSPACE_ONBOARDING_REQUIRED`：跳工作区初始化。
- `FEATURE_NOT_ENABLED`：展示升级套餐或功能未开放。
- `QUOTA_EXCEEDED`：展示用量不足，并给套餐/用量页入口。
- `ACCOUNT_LOGIN_REQUIRED` 或发布详情里的 `execution_stage === "login_required"`：引导用户重新绑定/登录对应小红书账号。
- `INVALID_REQUEST`：展示表单错误或通用请求错误。

### 13.6 轮询和刷新策略

前端需要轮询的地方只有三类：

- 小红书扫码登录：`GET /workspace/xhs-accounts/{account_id}/login-status`，2-5 秒一次，成功或超时后停止。
- Dashboard 手动同步后：刷新 `xhs-overview` 和 `xhs-accounts`，建议 3-5 秒一次，最多 1-3 分钟，状态不再是 `sync_pending` 后停止。
- 发布详情/列表：当 `execution_stage` 是 `pending_dispatch`、`dispatching`、`retry_scheduled` 时短轮询，进入 `published`、`failed`、`canceled`、`login_required` 后停止。

不要无条件全局轮询。轮询必须有停止条件，避免前端长期制造无意义请求。

## 14. 产品模块与当前后端能力边界

用户提到的长期产品方向包括：

- 小红书账号矩阵管理。
- 内容批量发布。
- 数据采集分析。
- 爆文分析。
- 竞品监控。
- 评论/私信运营。
- AI 生成内容。
- 报表交付。
- 团队协作审核流。
- 线索/商品转化分析。

当前已能落地到前端的模块：

- 小红书账号矩阵管理的第一版：账号列表、扫码绑定、登录状态。
- 内容发布第一版：发布记录创建、列表、详情、取消、重试、执行状态展示。
- 数据大屏第一版：全部账号/单账号 overview、今天对比昨天、手动同步。
- 团队和套餐底座：成员管理、权益、用量、套餐切换的基础接口。

当前只适合做占位或信息架构，不适合做真实交互的模块：

- 爆文分析。
- 竞品监控。
- 评论/私信运营。
- AI 生成内容。
- 报表交付。
- 审核流。
- 线索/商品转化分析。

这些模块后续需要先补后端领域模型、采集任务、列表/详情/统计接口，再做前端页面。前端可以先在导航或工作台里留入口，但不要调用不存在的接口。

## 15. 目前不要实现或不要假实现的内容

这些模块是产品方向，但当前后端没有完整接口，前端不要做成可交互假功能：

- 竞品监控完整模块。
- 爆文分析完整模块。
- 评论/私信运营完整模块。
- AI 生成内容。
- 报表导出交付。
- 团队审核流。
- 线索/商品转化分析。
- 官方后台曝光、阅读、成交等数据。
- 长周期趋势图。
- 自动定时同步管理。

如果需要先做 UI 占位，可以明确标注“即将接入”或“暂未开放”，不要调用不存在的接口。

## 16. 推荐第一阶段前端验收标准

第一阶段前端可以按以下标准验收：

- 用户能注册/登录/退出。
- 首次登录能创建工作区。
- 用户能绑定一个小红书账号，并看到二维码。
- 用户能查看账号列表和账号登录状态。
- Dashboard 能显示 no accounts、no data、sync pending/failed、ready 等状态。
- Dashboard 能触发手动同步，并刷新数据。
- Dashboard 能在全部账号和单账号之间切换。
- 发布中心能创建发布记录。
- 发布中心能显示任务执行阶段、失败原因、登录失效、发布成功。
- 发布中心能根据 `available_actions` 取消或重试。
- 用量页能显示当前套餐用量。
- 团队页能列出/添加/修改/移除成员。

## 17. 重要提醒

- `code` 是业务响应码，不是 HTTP 数字状态码。成功是 `"OK"`，不是 `200`。
- `message` 不用于业务分支。
- 小红书账号绑定不是管理端 worker 创建。
- Dashboard 页面打开时不要触发 live scraping，只读 overview；同步按钮才创建 sync run。
- worker 由后端调度，前端不要直接访问 `xhs-worker`。
- 所有用户端请求都走 `/api/v1/app`。
