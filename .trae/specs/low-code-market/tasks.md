# Tasks
- [x] Task 1: 初始化项目结构与后端基础
  - [x] SubTask 1.1: 创建后端 FastAPI 项目目录结构，配置依赖（FastAPI, Uvicorn, SQLAlchemy, Pandas, openpyxl 等）。
  - [x] SubTask 1.2: 设计 SQLite 数据库模型（包含应用名称、单位、领域、描述、图片链接、访问量、创建时间等字段）。
- [x] Task 2: 实现后端数据导入与 Excel 模板
  - [x] SubTask 2.1: 生成并保存一份用于数据导入的 Excel 模板文件（`import_template.xlsx`）。
  - [x] SubTask 2.2: 编写后端脚本，读取 Excel 文件并将数据写入 SQLite 数据库（包含一些模拟数据）。
- [x] Task 3: 实现后端 API 接口
  - [x] SubTask 3.1: 实现获取过滤选项（所有单位、所有领域）的 API。
  - [x] SubTask 3.2: 实现获取应用列表（支持按单位、领域搜索筛选）的 API。
  - [x] SubTask 3.3: 实现获取访问量排行榜的 API。
  - [x] SubTask 3.4: 实现获取底部统计数据（应用总数、推广分析、访问分析）及图表数据（领域占比、单位占比、新增趋势）的 API。
- [x] Task 4: 初始化前端项目结构
  - [x] SubTask 4.1: 使用 Vite + React + TS 初始化前端项目，安装所需依赖（axios, echarts, tailwindcss）。
  - [x] SubTask 4.2: 配置前端代理以解决跨域问题。
- [x] Task 5: 前端页面 UI 实现与联调
  - [x] SubTask 5.1: 实现顶部 Header、搜索栏和筛选区（单位、领域标签）。
  - [x] SubTask 5.2: 实现中间的主体内容区，包含左侧的应用卡片网格和右侧的排行榜。
  - [x] SubTask 5.3: 实现底部的统计数据展示区和三个 ECharts 图表（饼图、折线图）。
  - [x] SubTask 5.4: 实现页面 Footer 及样式美化，确保与设计图一致。
  - [x] SubTask 5.5: 对接后端 API，将真实数据渲染到页面上。
- [x] Task 6: 文档与测试
  - [x] SubTask 6.1: 运行前端项目检查是否有错误。
  - [x] SubTask 6.2: 更新项目根目录的 README.md，包含前后端运行说明和功能介绍，以及在所有生成的代码中添加函数级注释。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 5] depends on [Task 3, Task 4]
- [Task 6] depends on [Task 5]
