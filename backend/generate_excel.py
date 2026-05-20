import pandas as pd
from datetime import datetime, timedelta, date
import random
import os

def generate_excel():
    """生成带有模拟数据的 Excel 模板文件"""
    domains = ["专卖", "营销", "物流", "办公室",  "综合计划", "内管",  "法规", "财务", "审计", "人事", "党建","纪检", "安全", "群团", "服务中心", "信息中心", "学会", "规范"]
    units = ["市局", "一局", "二局", "三局", "东丽", "西青", "津南", "北辰", "滨海", "宝坻", "武清", "蓟县", "静海", "宁河", "营销", "公路", "恒实"]
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
            "visits": random.randint(20_000, 500_000),
            "data_amount": random.randint(1_000_000, 9_000_000),
            "created_at": (now - timedelta(days=random.randint(0, 360))).strftime("%Y-%m-%d %H:%M:%S")
        })
        
    df_apps = pd.DataFrame(app_data)
    
    # 生成月度数据：月份、新增数据量、新增访问人数
    monthly_stats_data = []
    first_day_of_current_month = now.replace(day=1)
    for i in range(11, -1, -1):
        target_date = first_day_of_current_month - pd.DateOffset(months=i)
        month_str = target_date.strftime("%Y-%m")
        monthly_stats_data.append({
            "month": month_str,
            "new_data_amount": random.randint(1_000_000, 9_000_000),
            "new_visitors": random.randint(50_000, 300_000),
        })
    df_monthly_stats = pd.DataFrame(monthly_stats_data)
    
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "import_template.xlsx")

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df_apps.to_excel(writer, sheet_name="apps", index=False)
        df_monthly_stats.to_excel(writer, sheet_name="monthly_stats", index=False)
        
    print("Excel generated successfully!")

if __name__ == "__main__":
    generate_excel()
