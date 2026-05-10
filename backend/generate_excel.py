import pandas as pd
from datetime import datetime, timedelta, date
import random

def generate_excel():
    """生成带有模拟数据的 Excel 模板文件"""
    domains = ["专卖", "营销", "物流", "办公室",  "综合计划", "内管",  "法规", "财务", "审计", "人事", "党建", "安全", "群团", "服务中心", "信息中心", "学会", "规范"]
    units = ["市局", "一局", "二局", "三局", "东丽", "西青", "津南", "北辰", "滨海", "宝坻", "武清", "蓟县", "静海", "宁河"]
    values = ["业务线上化","业务规范化","数据可视化","管理协同","系统对接"]

    app_data = []


    now = datetime.now()
    
    # 模拟过去一年的数据
    for i in range(1, 101):
        app_data.append({
            "id": i,
            "name": f"应用_{i}",
            "unit": random.choice(units),
            "domain": random.choice(domains),
            "description": f"这是应用_{i}的描述信息",
            "img_url": f"https://picsum.photos/seed/{i}/200",
            "link": f"https://example.com/app/{i}",
            "features": ",".join(random.sample(values, random.randint(1, len(values)))),
            "visits": 0, # 将由明细数据汇总
            "promotion_times": random.randint(0, 50),
            "created_at": (now - timedelta(days=random.randint(0, 360))).strftime("%Y-%m-%d %H:%M:%S")
        })
        
    df_apps = pd.DataFrame(app_data)
    
    # 生成每日访问数据
    daily_stats_data = []
    # 选取最近两个月的数据，比如 60 天
    for app in app_data:
        created_date = datetime.strptime(app["created_at"], "%Y-%m-%d %H:%M:%S").date()
        total_visits = 0
        for day_offset in range(60):
            current_date = now.date() - timedelta(days=day_offset)
            if current_date >= created_date:
                daily_visits = random.randint(0, 100)
                daily_visitors = int(daily_visits * random.uniform(0.5, 0.9))
                total_visits += daily_visits
                daily_stats_data.append({
                    "app_id": app["id"],
                    "stat_date": current_date.strftime("%Y-%m-%d"),
                    "visits": daily_visits,
                    "visitors": daily_visitors
                })
        
        app["visits"] = total_visits
    
    # 更新 app_data 中的 visits
    df_apps = pd.DataFrame(app_data)
    df_daily_stats = pd.DataFrame(daily_stats_data)
    
    with pd.ExcelWriter("d:/2-code/mall/import_template_v3.xlsx", engine="openpyxl") as writer:
        df_apps.to_excel(writer, sheet_name="apps", index=False)
        df_daily_stats.to_excel(writer, sheet_name="daily_stats", index=False)
        
    print("Excel generated successfully!")

if __name__ == "__main__":
    generate_excel()
