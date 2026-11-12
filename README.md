# 省心券 · 淘宝 / 京东优惠券推广页

这是一个移动端优先的淘宝客 + 京东联盟优惠券推广网页，使用 Vue 3、Vue Router、Vite、Vant 4、Tailwind CSS 和 Node.js API 构建。

页面分别请求淘宝客和京东联盟的真实商品数据；对应接口暂时不可用或没有商品时，页面会显示空状态并提示检查接口配置。

## 功能

- 淘宝物料精选商品展示
- 京东联盟物料（京粉精选 / 关键词商品）展示
- 淘宝、京东双平台独立页面，通过顶部图标切换
- 关键词搜索优惠券
- 美妆、家居、服饰、零食等分类筛选（京东为精选频道）
- 原价、券金额、券后价、销量展示
- 商品详情弹窗
- 复制淘口令（淘宝）/ 复制京口令（京东）
- 直接打开淘宝领券页面 / 京东商品页
- 移动端双列布局、PC 端响应式多列布局
- Remix Icon 图标

## 技术栈

- Vue 3
- Vue Router 4
- Vite
- Vant 4
- Tailwind CSS
- Express
- Node.js Fetch API
- 淘宝 TOP API / 京东联盟 JOS API

## 目录结构

```text
D:\Coupon
├─ src\
│  ├─ App.vue                  # 应用外壳，只负责挂载路由
│  ├─ main.js                  # Vue 应用入口
│  ├─ router\index.js          # 页面路由
│  ├─ views\                   # 页面：一个页面一个文件夹
│  │  ├─ taobao\TaobaoHomeView.vue
│  │  ├─ jd\JdHomeView.vue
│  │  └─ search\SearchView.vue
│  ├─ components\              # 跨页面复用组件（商品卡、详情弹窗、分类等）
│  ├─ composables\             # 商品流、复制/跳转等组合逻辑
│  ├─ services\                # 统一的数据请求
│  ├─ constants\               # 平台配置与兜底分类
│  ├─ utils\                   # 金额、销量格式化
│  └─ styles.css               # Tailwind 和全局样式
├─ server\
│  ├─ index.js                 # Express 路由入口
│  ├─ taobao.js                # 淘宝客 API、签名与数据归一化
│  └─ jd.js                    # 京东联盟 API、签名与数据归一化
├─ api\                        # Vercel Serverless Function 入口
├─ index.html
├─ vite.config.js              # Vite 开发服务器和 API 代理
├─ tailwind.config.js
├─ postcss.config.js
└─ package.json
```

## 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本
- 可访问淘宝开放平台、京东联盟接口的网络环境

## 安装依赖

在项目根目录执行：

```bash
npm install
```

如果 Windows 环境中的 npm 缓存目录没有写权限，可以指定一个当前用户可写的缓存目录：

```bash
npm install --cache .npm-cache
```

## 配置推广参数

淘宝客和京东联盟的密钥只在 Node.js 服务端使用，不会发送到浏览器。生产环境建议通过环境变量注入，不要把真实密钥提交到代码仓库。

PowerShell 示例：

```powershell
$env:TAOBAO_APPKEY = "你的 appkey"
$env:TAOBAO_SECRET = "你的 secret"
$env:TAOBAO_ADZONE_ID = "你的推广位三段值"
$env:TAOBAO_SESSION = "test"

$env:JD_APPKEY = "你的京东 appkey"
$env:JD_SECRET = "你的京东 secretkey"
$env:JD_PID = "你的京东推广位三段值"
$env:JD_SITE_ID = "你的京东网站 ID"
```

当前项目已按需求配置淘宝、京东两套凭证的服务端默认值；如需更换账号，优先使用上述环境变量覆盖。

支持的环境变量：

| 环境变量 | 说明 | 默认值 |
| --- | --- | --- |
| `API_PORT` | Node API 端口 | `3001` |
| `TAOBAO_APPKEY` | 淘宝开放平台 AppKey | 项目服务端配置 |
| `TAOBAO_SECRET` | 淘宝开放平台 Secret | 项目服务端配置 |
| `TAOBAO_ADZONE_ID` | 淘宝客推广位 ID | `112334700203` |
| `TAOBAO_SESSION` | TOP Session | `test` |
| `JD_APPKEY` | 京东联盟 AppKey | 项目服务端配置 |
| `JD_SECRET` | 京东联盟 SecretKey | 项目服务端配置 |
| `JD_PID` | 京东联盟推广位 PID（`网站ID_推广位ID_子推广位ID`） | 项目服务端配置 |
| `JD_SITE_ID` | 京东联盟网站 ID | 项目服务端配置 |
| `JD_ACCESS_TOKEN` | 京东联盟 access_token（可选，部分接口需要） | 空 |
| `JD_API_URL` | 京东 JOS 网关地址 | `https://api.jd.com/routerjson` |

## 启动开发环境

前后端现在可以用一个命令同时启动：

```bash
npm run dev
```

启动后访问：

```text
http://localhost:5173
```

Node API 默认地址：`http://localhost:3001`。如果端口已被占用，Vite 会自动选择下一个可用端口；API 端口可通过 `API_PORT` 环境变量修改。

如需只启动某一侧，也可以使用：

```bash
npm run dev:api
npm run dev:client
```

### 调试 Node 后端

> 终端执行`npm run dev:client` 启动前端
> VSCode 按 F5，选「调试后端 API」

`.vscode/launch.json` 已提供后端调试配置，断点可命中 `server/index.js`、`server/taobao.js`、`server/jd.js` 等所有后端文件：

- **调试后端 API**：直接以调试模式启动 `server/index.js`，配合终端里的 `npm run dev:client` 使用，前端请求会走本机 API。
- **全栈调试（Vite + API）**：一次启动前端 Vite 和后端 API，两侧都能打断点。
- **附加到后端（9229）**：先用 `npm run dev:api:debug` 在终端启动后端，再选择该配置附加进程。

注意：`npm run dev` 会同时启动前端和后端，端口与调试配置冲突，调试后端时请改用上面的方式。

## 生产构建

构建前端静态文件：

```bash
npm run build
```

构建产物会生成在 `dist` 目录。

预览构建结果：

```bash
npm run preview
```

Node API 仍然需要单独启动：

```bash
npm run dev:api
```

## Vercel 部署

项目根目录的 `api` 文件夹会被 Vercel 自动部署为 Serverless Functions，前端继续使用同源的 `/api/*` 地址即可。请在 Vercel 项目的 Environment Variables 中配置 `TAOBAO_APPKEY`、`TAOBAO_SECRET`、`TAOBAO_ADZONE_ID`、`TAOBAO_SESSION` 以及 `JD_APPKEY`、`JD_SECRET`、`JD_PID`、`JD_SITE_ID`，然后重新部署项目。

## API 接口

### 淘宝

```http
GET /api/categories
```

```http
GET /api/products?category=all&page=1&size=12&q=粉底液
```

返回结构：

```json
{
  "products": [],
  "page": 1,
  "hasMore": true,
  "source": "taobao"
}
```

`source` 固定为 `taobao`，表示商品来自淘宝客接口。

### 京东

```http
GET /api/jd/categories
```

```http
GET /api/jd/products?category=all&page=1&size=12&q=手机
```

返回结构：

```json
{
  "products": [],
  "page": 1,
  "hasMore": true,
  "totalCount": 0,
  "source": "jd"
}
```

`source` 固定为 `jd`，表示商品来自京东联盟接口。`totalCount` 为京东返回的商品总数，接口不可用时可能不返回。

### 生成京口令

```http
POST /api/jd/command
Content-Type: application/json
```

请求体：

```json
{
  "url": "https://jingfen.jd.com/detail/xxxx.html"
}
```

返回结构：

```json
{
  "command": "6.0复制整段话 http://xxxx京口令内容#xxxx",
  "clickUrl": "https://union-click.jd.com/jdc?xxxx",
  "source": "jd-command"
}
```

`command` 为京口令；当京东未返回京口令时，页面会弹窗提示，用户点击「立即前往」按钮后跳转 `clickUrl` 推广链接；两者都没有时前端会退回复制原始商品链接。

### 生成淘口令

```http
POST /api/tpwd
Content-Type: application/json
```

请求体：

```json
{
  "url": "https://uland.taobao.com/coupon/edetail?...",
  "text": "商品标题"
}
```

返回结构：

```json
{
  "password": "￥xxxx￥",
  "source": "taobao"
}
```

如果淘宝接口无法生成淘口令，接口会返回原始商品链接，前端仍然可以完成复制操作。

### 健康检查

```http
GET /api/health
```

## 淘宝接口说明

Node API 根据接口文档实现了淘宝 TOP API v2.0 的请求签名：

1. 添加 `app_key`、`method`、`timestamp`、`format`、`v` 等系统参数。
2. 按参数名排序并拼接 `key + value`。
3. 使用 `secret + 参数串 + secret` 生成 MD5。
4. 将大写 MD5 作为 `sign` 参数提交。

当前使用的主要接口：

- `taobao.tbk.dg.material.recommend`
- `taobao.tbk.dg.material.optional.upgrade`
- `taobao.tbk.tpwd.create`

## 京东接口说明

京东联盟走 JOS 网关 `https://api.jd.com/routerjson`，签名方式与淘宝类似：

1. 业务参数整体序列化为 JSON，放入系统参数 `360buy_param_json`。
2. 添加 `method`、`app_key`、`timestamp`（北京时间 `yyyy-MM-dd HH:mm:ss`）、`format=json`、`v=1.0`、`sign_method=md5`。
3. 按参数名排序并拼接 `key + value`，用 `secret + 参数串 + secret` 生成 MD5。
4. 将大写 MD5 作为 `sign` 参数提交。

响应外层 key 形如 `jd_union_open_goods_jingfen_query_responce`（官方拼写为 `responce`），内层查询结果字段（`queryResult` / `getResult`）可能是 JSON 字符串，服务端已做二次解析，并在 `code !== 200` 时抛出错误。

当前使用的主要接口：

- `jd.union.open.goods.jingfen.query`：京粉精选物料（首页分类频道）
- `jd.union.open.goods.query`：关键词商品查询（搜索）
- `jd.union.open.goods.material.query`：猜你喜欢物料（京粉精选不可用时的降级）
- `jd.union.open.promotion.common.get`：商品转链并生成京口令（`command=1` 返回 `jCommand`）

商品归一化后与淘宝共用同一份数据结构，仅通过 `source: "jd"` 区分来源；图片域名已统一为 `https`，避免混合内容拦截。

## 常见问题

### 页面显示空状态

说明对应平台的接口暂时返回错误、无数据或当前环境无法访问开放平台。检查 AppKey、Secret、推广位和网络后，重新运行 `npm run dev` 即可。淘宝页检查淘宝开放平台，京东页检查京东联盟配置。页面不会展示本地演示商品。

### 商品图片没有加载

淘宝商品图片通常来自 `img.alicdn.com`，京东商品图片通常来自 `img14.360buyimg.com` 等域名，需要浏览器可以访问对应 CDN。

### 淘口令生成失败

淘宝淘口令接口对商品链接、推广位和账号权限有要求。接口失败时页面会自动复制商品链接，用户仍然可以点击“打开优惠券页面”。

### 京东页面没有数据

京东联盟接口对 AppKey 权限、推广位 PID 与网站 ID 的绑定关系有要求；若返回 `403`、`408` 或提示 unionid 缺失，需要在京东联盟后台确认应用已开通「京粉精选」「商品查询」等权限，并确认 PID 与网站 ID 属于同一账号。京东商品的复制按钮会调用转链接口生成京口令；当京东未返回京口令时弹窗提供「立即前往」按钮跳转推广链接，接口失败时自动退回复制原始商品链接。

服务端会把京东网关的真实错误写入终端日志，例如 `[/api/jd/products] error: 京东接口 408：unionid被限制调用`；页面也会用提示条展示同样的信息。首页京粉精选接口不可用时会自动降级到同为非权限的「猜你喜欢」物料接口（`jd.union.open.goods.material.query`）。关键词搜索使用的 `jd.union.open.goods.query` 属于需要申请的权限接口，未开通时会返回对应的权限错误。

### 如何更换推广位

淘宝使用 `TAOBAO_ADZONE_ID`，京东使用 `JD_PID`（三段值）与 `JD_SITE_ID`，修改后重新启动 Node API：

```powershell
$env:TAOBAO_ADZONE_ID = "你的淘宝推广位三段值"
$env:JD_PID = "网站ID_推广位ID_子推广位ID"
npm run dev:api
```

## 开发检查

```bash
npm run build
```

构建成功后会输出 Vite 的产物大小，并生成 `dist` 目录。
