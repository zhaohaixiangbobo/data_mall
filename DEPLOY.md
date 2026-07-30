# 远端服务器部署文档（Linux + Nginx + systemd）

本项目包含：
- 前端：Vite + React（构建产物为静态文件）
- 后端：FastAPI + SQLite（提供 `/api/*` 接口）

以下说明以 Ubuntu/Debian 为例，CentOS/RHEL 仅包管理命令不同。

## 1. 服务器准备

### 1.1 安装基础依赖

```bash
sudo apt update
sudo apt install -y git nginx python3 python3-venv python3-pip
```

### 1.2 安装 Node.js（用于构建前端）

建议使用 Node 20+。

## 2. 拉取代码

```bash
sudo mkdir -p /opt/mall
sudo chown -R $USER:$USER /opt/mall
cd /opt/mall
git clone <你的仓库地址> .
```

## 3. 后端部署（systemd）

### 3.1 创建 Python 虚拟环境并安装依赖

```bash
cd /opt/mall/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

### 3.2 配置后端环境变量（backend/.env）

在服务器上创建文件：
- `/opt/mall/backend/.env`

内容示例（按需修改）：

```dotenv
MALL_ADMIN_USERNAME=admin
MALL_ADMIN_PASSWORD=admin123
MALL_JWT_SECRET=please-change-this-to-a-long-random-string
```

说明：
- `MALL_ADMIN_USERNAME / MALL_ADMIN_PASSWORD`：上传系统登录账号密码
- `MALL_JWT_SECRET`：JWT 签名密钥，务必在生产环境更换为随机长串

### 3.3 准备导入模板

后端默认从以下位置读取 Excel：
- `/opt/mall/backend/data/latest.xlsx`（优先）
- `/opt/mall/backend/data/import_template.xlsx`（兜底）

首次部署建议生成一个默认模板：

```bash
cd /opt/mall/backend
source .venv/bin/activate
python generate_excel.py
```

### 3.4 创建 systemd 服务

创建文件：
- `/etc/systemd/system/mall-backend.service`

内容示例：

```ini
[Unit]
Description=Mall Backend (FastAPI)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/mall/backend
Environment=PYTHONUNBUFFERED=1
ExecStart=/opt/mall/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable mall-backend
sudo systemctl start mall-backend
sudo systemctl status mall-backend --no-pager
```

## 4. 前端部署（构建静态文件 + Nginx）

### 4.1 构建

```bash
cd /opt/mall/frontend
npm install
npm run build
```

构建产物位于：
- `/opt/mall/frontend/dist`

### 4.2 Nginx 配置

创建文件：
- `/etc/nginx/sites-available/mall`

内容示例（替换域名/证书路径等）：

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /opt/mall/frontend/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # React Router: /login /upload 等路径需要回退到 index.html
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

启用站点并重载 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/mall /etc/nginx/sites-enabled/mall
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 访问与验证

### 5.1 前端页面

- 首页：`http://your-domain.com/`
- 登录页：`http://your-domain.com/login`
- 上传页：`http://your-domain.com/upload`

### 5.2 后端接口

- `http://your-domain.com/api/stats`

### 5.3 上传数据流程

1. 访问 `/login` 登录
2. 跳转到 `/upload` 选择 `.xlsx` 文件上传
3. 上传成功后，后端会清空旧数据并重新导入（apps + monthly_stats）

## 6. 常见问题排查 (Troubleshooting)

### 6.1 页面出现乱码、字体不正确、或者样式丢失 (UI 错乱/无 Tailwind 样式)

如果您在浏览器中看到页面中文乱码，或者像图片中那样**颜色丢失、排版错乱、边距和背景图完全没有生效**，这 100% 是 **Nginx 配置缺少 MIME Types** 或 **字符集未设置** 导致的。
当 Nginx 没有正确返回 `text/css` 头时，浏览器会拒绝应用生成的 Tailwind CSS，导致页面变成纯 HTML 骨架。

**解决方案：**
编辑您的 Nginx 配置文件（如 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/mall`）：
1. 确保 `http { ... }` 块内有 `include mime.types;`
2. 确保配置了 `charset utf-8;`

正确的 Nginx 站点配置示例：
```nginx
server {
  listen 80;
  server_name your-domain.com;
  
  # 解决乱码
  charset utf-8;

  root /opt/mall/frontend/dist;
  index index.html;

  # 解决 CSS 样式不加载 (如果外部 nginx.conf 没有 include 的话)
  include /etc/nginx/mime.types;

  location / {
    try_files $uri $uri/ /index.html;
  }
  # ... 其他 api 配置 ...
}
```
修改后执行 `sudo nginx -t` 和 `sudo systemctl reload nginx`，然后**强制刷新浏览器 (Ctrl+F5)** 即可恢复正常的漂亮 UI。

### 6.2 启动时报 “Worksheet named 'apps' not found”

说明上传/默认 Excel 文件不是标准导入模板（缺少 `apps` sheet）。
请使用包含以下 sheet 的 Excel：
- `apps`
- `monthly_stats`

### 6.2 /upload 刷新后 404

说明 Nginx 未配置 SPA 回退。需要：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

