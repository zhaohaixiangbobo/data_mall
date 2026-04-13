# 低代码应用集市 Spec

## Why
用户需要一个基于 React + Vite + TS (前端) 和 FastAPI (后端) 的低代码应用集市页面。该页面需要根据提供的设计图进行复刻，并要求数据从 Excel 文件导入并存储到 SQLite 数据库中。同时，页面需要展示真实的应用卡片、排行榜以及底部的统计分析图表。

## What Changes
- 创建并初始化后端 FastAPI 项目，使用 SQLAlchemy 连接 SQLite。
- 实现后端 Excel 数据读取逻辑，并将数据持久化到 SQLite 中。
- 提供后端 API，用于：获取应用列表（支持单位和领域筛选）、获取访问量排行榜、获取应用统计分析数据。
- 创建并初始化前端 React + Vite + TS 项目。
- 使用 Tailwind CSS 和 ECharts 实现页面 UI 布局，包括：
  - 顶部筛选区（按单位、领域）。
  - 中间应用卡片展示区及右侧排行榜。
  - 底部应用分析、推广分析、访问分析卡片，以及各个维度的统计图表。
- 根目录提供数据导入的 Excel 模板。
- 更新项目根目录的 README.md，说明项目的运行方式和功能。

## Impact
- Affected specs: 这是一个从零开始的前后端分离全栈实现，将创建一个全新的应用集市页面。
- Affected code:
  - `backend/` 目录：存放 FastAPI 代码和数据库文件。
  - `frontend/` 目录：存放 React 项目代码。
  - 根目录生成 Excel 模板文件。

## ADDED Requirements
### Requirement: Excel 数据导入
系统应能提供一个 Excel 模板，并通过脚本或接口读取其中的数据，将其存储到 SQLite 数据库中。

#### Scenario: 初始化数据
- **WHEN** 启动后端服务时，或通过特定脚本执行导入
- **THEN** 系统解析 Excel 模板内容，并将“应用名称、单位、领域、访问量、推广次数、发布时间”等数据写入数据库。

### Requirement: 前端应用集市页面
页面应高度还原设计图的布局与交互。

#### Scenario: 查看应用和图表
- **WHEN** 用户访问前端页面
- **THEN** 页面展示各类应用的卡片，右侧显示访问量排行榜，底部渲染基于真实数据的统计卡片和图表。
