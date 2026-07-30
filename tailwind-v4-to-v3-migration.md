# Tailwind CSS v4 降级到 v3 兼容旧浏览器方案

> 本文用于解决政企定制浏览器（例如奇安信、部分 360 浏览器）页面样式大面积丢失的问题；适用对象为本项目当前的 Vite + React 前端。

## 审核结论

**可以解决，且应优先实施 Tailwind v4 降级到 v3.4。** 但原方案需修正：问题的根因不是 Nginx，而是当前构建出的 Tailwind v4 CSS 超出了旧浏览器的能力范围；只增加 MIME 配置或只设置 Vite `build.target` 都不能修复这份 CSS。

本地现有构建产物 `frontend/dist/assets/index-Dho3_BWt.css` 已确认包含：

- 5 个原生 `@layer`；
- 63 个 `@property`；
- 28 个 `color-mix()`；
- 47 个 `oklch()`。

Tailwind 官方规定 v4 的目标浏览器为 Chrome 111+、Safari 16.4+、Firefox 128+，并明确建议需要支持旧浏览器时保留在 v3.4。奇安信浏览器若使用 Chrome 69--86 内核，会跳过不支持的原生 `@layer` 规则块，导致大量工具类整体失效。这与“页面 DOM 和文字存在，但布局、颜色、间距大面积丢失；Chrome 正常”的现象一致。

截图中的 Nginx 配置在 `mime.types` 被成功加载的前提下是有效的。Nginx 对同一个 URL 不会按浏览器选择不同 CSS；若 CSS MIME 类型错误，通常所有未缓存的浏览器都会拒绝该样式表。因此 MIME 配置仍需验证，但不是本次的首要判断。

## 修正后的实施方案

### 0. 先记录目标浏览器内核版本

在异常浏览器打开控制台或地址栏的版本页，记录其 Chromium/Chrome 版本。若低于 111，则本方案适用；若已经是 111+，先按“部署与 Nginx 验证”排查，不应直接降级。

### 1. 变更依赖

在 `frontend` 目录执行。`postcss` 与 `autoprefixer` 已在项目开发依赖中，命令会保留或更新它们。

```bash
npm uninstall tailwindcss @tailwindcss/vite
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

不要使用不带版本范围的 `tailwindcss@3`；固定到 v3.4 系列，保证 `line-clamp-2` 和命名分组等项目现有写法可用。

### 2. 新建 v3 配置文件

本项目 `package.json` 设置了 `"type": "module"`。为避免配置文件模块类型歧义，使用 `.cjs` 和 CommonJS 写法，而不是原方案中的 `.js` + `export default`。

新建 `frontend/tailwind.config.cjs`：

```js
/** Tailwind v3 扫描范围：仅生成源码实际使用到的工具类。 */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

新建 `frontend/postcss.config.cjs`：

```js
/** Tailwind v3 通过 PostCSS 在构建时展开为旧浏览器可解析的 CSS。 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3. 修改 Vite 配置

删除 `@tailwindcss/vite` 的导入和插件调用，并把 JavaScript 语法编译目标设为需要支持的最低 Chromium 内核。项目当前问题即使只改这里也**不会**解决，因为此项只处理 JS 语法，不能把 Tailwind v4 的 `@layer`、`oklch()` 等 CSS 变成旧 CSS。

`frontend/vite.config.ts` 应为：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 兼容 Chromium 69 及以上的政企浏览器；CSS 兼容由 Tailwind v3 负责。
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'chrome69',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

若实际最低内核高于 69，可相应提高此值；若低于 61 或不支持 ES modules，需要另行评估 `@vitejs/plugin-legacy` 和运行时 polyfill，不能只靠 `build.target`。

### 4. 切换 CSS 入口

将 `frontend/src/index.css` 中的：

```css
@import "tailwindcss";
```

替换为：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #f3f4f6; /* 页面默认浅灰背景 */
}
```

### 5. 代码兼容性与视觉回归

项目中使用的 `bg-gradient-to-r`、命名分组 `group/desc`、透明度修饰、任意值和 `line-clamp-2` 都可由 Tailwind v3.4 生成，业务 `.tsx` 文件预计无需为“能构建”而修改。

但不能承诺“视觉完全无差异”：项目大量使用 `shadow-sm`，而 Tailwind v4 对阴影命名做过调整。降到 v3 后它会变为 v3 的较弱阴影。构建成功后，需重点比对卡片、筛选框和页头阴影；若希望保留当前 v4 的阴影观感，可把需要更接近 v4 `shadow-sm` 的位置改为 v3 的 `shadow`，再逐页确认。

### 6. 构建与静态检查

```bash
npm run build

# Linux/macOS
grep -R -nE 'oklch\(|color-mix\(|@property|@layer' dist/assets || true

# PowerShell
Get-ChildItem dist/assets -Filter '*.css' | Select-String -Pattern 'oklch\(|color-mix\(|@property|@layer'
```

预期：构建成功，且 CSS 检查没有匹配结果。检查结果为“无输出”是通过，不是失败。

## 部署与 Nginx 验证

### 建议站点配置

将 `root` 放在 `server` 层级；`mime.types` 一般已在主配置的 `http` 块中加载。若主配置确实没有加载，可保留站点中的 `include /etc/nginx/mime.types;`。

```nginx
server {
    listen 80;
    server_name _;

    root /opt/data_mall/frontend/dist;
    index index.html;
    charset utf-8;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 带哈希的静态资源不得回退到 index.html，避免把 404 CSS/JS 伪装成 HTML 200。
    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router 的前端路由回退。
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

说明：现有 `proxy_pass http://127.0.0.1:8000;` 会保留 `/api/...` 路径，符合当前后端路由；不要无依据地同时修改前后端 API 前缀。

### 发布顺序

1. 在本地构建并完成上面的 CSS 静态检查。
2. 上传完整的 `frontend/dist/`；不要只上传 `index.html` 或只上传某一个 assets 文件，避免 HTML 引用与哈希资源不一致。
3. 在服务器执行 `sudo nginx -t`，通过后执行 `sudo systemctl reload nginx`。
4. 用无痕窗口或 Ctrl+F5 验证 Chrome 和奇安信；由于文件名带 hash，旧资源不会被新 HTML 复用，但旧页面标签页仍应关闭或强刷。

### 在服务器上验证 MIME 与资源路径

从部署后的 `dist/index.html` 取出实际 CSS 文件名，再执行（替换为真实地址和文件名）：

```bash
curl -I http://127.0.0.1/assets/index-xxxxxxxx.css
```

预期同时满足：HTTP 200、`Content-Type: text/css`，且响应不是 HTML。若响应为 404、`text/html` 或实际 CSS 文件名不存在，先修复部署完整性/静态路径；若这三项正常而旧浏览器仍异常，再核对其内核版本与构建产物是否已经换成 v3。

## 回滚

保留迁移前的 `package-lock.json`、`vite.config.ts` 和 `src/index.css` 副本或 Git 提交。回滚时恢复这三项，删除 `tailwind.config.cjs`、`postcss.config.cjs`，然后重新安装 v4 依赖并构建发布。

## 不建议的单独措施

- **只加 `charset utf-8` 或 `mime.types`**：只能修复响应头/编码错误，不能让 Chrome 69--86 解析 Tailwind v4 CSS。
- **只设 `build.target: 'chrome80'`**：不处理 CSS，且与“最低 Chrome 69”目标矛盾。
- **仅删除 `oklch()` 文本**：`@layer`、`@property`、`color-mix()` 仍会留下，维护成本高且无法保证完整性。