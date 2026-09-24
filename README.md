# 省心券 · 淘宝优惠券推广页

这是一个移动端优先的淘宝客优惠券推广网页，使用 Vue 3、Vite、Vant 4、Tailwind CSS 和 Node.js API 构建。

页面只请求淘宝客真实商品数据；淘宝接口暂时不可用或没有商品时，页面会显示空状态并提示检查接口配置。

## 功能

- 淘宝物料精选商品展示
- 关键词搜索优惠券
- 美妆、家居、服饰、零食等分类筛选
- 原价、券金额、券后价、销量展示
- 商品详情弹窗
- 复制淘口令
- 直接打开淘宝优惠券页面
- 商品收藏
- 移动端双列布局和底部导航
- PC 端响应式多列布局
- Remix Icon 图标

## 技术栈

- Vue 3
- Vite
- Vant 4
- Tailwind CSS
- Express
- Node.js Fetch API
- 淘宝 TOP API

## 目录结构

```text
D:\Coupon
├─ src\
│  ├─ App.vue          # 页面主体和交互
│  ├─ main.js          # Vue 应用入口
│  └─ styles.css       # Tailwind 和全局样式
├─ server\
│  └─ index.js         # 淘宝客 API 服务和签名逻辑
├─ index.html
├─ vite.config.js      # Vite 开发服务器和 API 代理
├─ tailwind.config.js
├─ postcss.config.js
└─ package.json
```

## 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本
- 可访问淘宝开放平台接口的网络环境

## 安装依赖

在项目根目录执行：

```bash
npm install
```

如果 Windows 环境中的 npm 缓存目录没有写权限，可以指定一个当前用户可写的缓存目录：

```bash
npm install --cache .npm-cache
```

## 配置淘宝客参数

淘宝客密钥只在 Node.js 服务端使用，不会发送到浏览器。生产环境建议通过环境变量注入，不要把真实密钥提交到代码仓库。

PowerShell 示例：

```powershell
$env:TAOBAO_APPKEY = "你的 appkey"
$env:TAOBAO_SECRET = "你的 secret"
$env:TAOBAO_ADZONE_ID = "你的推广位三段值"
$env:TAOBAO_SESSION = "test"
```

当前项目已按需求配置 AppKey 和 Secret 的服务端默认值；如需更换账号，优先使用上述环境变量覆盖。

支持的环境变量：

| 环境变量 | 说明 | 默认值 |
| --- | --- | --- |
| `API_PORT` | Node API 端口 | `3001` |
| `TAOBAO_APPKEY` | 淘宝开放平台 AppKey | 项目服务端配置 |
| `TAOBAO_SECRET` | 淘宝开放平台 Secret | 项目服务端配置 |
| `TAOBAO_ADZONE_ID` | 淘宝客推广位 ID | `112334700203` |
| `TAOBAO_SESSION` | TOP Session | `test` |

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

## API 接口

### 获取分类

```http
GET /api/categories
```

### 获取商品

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

## 常见问题

### 页面显示空状态

说明淘宝接口暂时返回错误、无数据或当前环境无法访问淘宝开放平台。检查 AppKey、Secret、推广位和网络后，重新运行 `npm run dev` 即可。页面不会展示本地演示商品。

### 商品图片没有加载

淘宝商品图片通常来自 `img.alicdn.com`，需要浏览器可以访问淘宝 CDN。

### 淘口令生成失败

淘宝淘口令接口对商品链接、推广位和账号权限有要求。接口失败时页面会自动复制商品链接，用户仍然可以点击“打开优惠券页面”。

### 如何更换推广位

使用 `TAOBAO_ADZONE_ID` 环境变量覆盖默认推广位，然后重新启动 Node API：

```powershell
$env:TAOBAO_ADZONE_ID = "你的推广位三段值"
npm run dev:api
```

## 开发检查

```bash
npm run build
```

构建成功后会输出 Vite 的产物大小，并生成 `dist` 目录。
