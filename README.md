# Mall 应用商城

## 后端项目 (Backend)

后端项目基于 FastAPI 构建，使用 SQLite 数据库。

### 技术栈

- FastAPI
- SQLAlchemy
- SQLite
- Pandas (用于读取 Excel 数据)
- Uvicorn

### 启动方式

1. 进入 `backend` 目录
2. 安装依赖: `pip install -r requirements.txt`
3. 启动服务: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
4. 首次启动时，会自动读取项目根目录的 `import_template.xlsx`，并将生成的模拟数据写入 SQLite 数据库 (`mall.db`)。

### 提供的 API 接口

- `GET /api/filters`: 返回可选的单位 (units) 和业务领域 (domains)
- `GET /api/apps`: 返回应用列表，支持按 `unit`, `domain`, `search` 进行查询
- `GET /api/ranking`: 返回访问量排名前 15 的应用
- `GET /api/stats`: 返回应用统计数据，包括图表数据

### 数据模型

- `App`: id, name, unit, domain, description, img\_url, visits, promotion\_times, created\_at

## 前端项目 (Frontend)

前端项目基于 Vite + React + TypeScript 构建，用于展示低代码应用集市。

### 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- ECharts & echarts-for-react
- Axios
- Lucide React (图标库)

### 启动方式

1. 进入 `frontend` 目录: `cd frontend`
2. 安装依赖: `npm install`
3. 启动开发服务器: `npm run dev` (默认配置代理 `http://localhost:8000` 解决跨域)

### 功能特性

- **头部导航**: 展示系统标题和当前日期。
- **筛选区域**: 支持按应用名称搜索，以及按单位和业务领域进行下拉筛选。
- **应用列表**: 使用网格卡片展示应用信息（名称、描述、所属单位及领域等）。
- **排行榜**: 展示访问量 Top 15 的应用列表。
- **统计面板**:
  - 概览卡片：应用总数、本月新增、累计推广、累计访问。
  - 数据图表：包含业务领域分布饼图、建设单位分布饼图以及应用新增趋势折线图。

## 数据导入模板

项目中自动生成了一个 `import_template.xlsx`，包含模拟生成的应用数据，供系统初始化和测试使用。
