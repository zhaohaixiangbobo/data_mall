from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import pandas as pd
import os
from datetime import datetime
from contextlib import asynccontextmanager

from database import engine, get_db, Base, SessionLocal
import models
import schemas

models.Base.metadata.create_all(bind=engine)

def seed_data():
    """读取 Excel 文件并在数据库为空时注入模拟数据"""
    db = SessionLocal()
    try:
        if db.query(models.App).count() == 0:
            excel_path = "d:/2-code/mall/import_template_v2.xlsx"
            if os.path.exists(excel_path):
                # 导入 Apps
                df_apps = pd.read_excel(excel_path, sheet_name="apps")
                for _, row in df_apps.iterrows():
                    created_at = row.get("created_at")
                    if pd.isna(created_at):
                        created_at = datetime.utcnow()
                    elif isinstance(created_at, str):
                        created_at = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
                    elif isinstance(created_at, pd.Timestamp):
                        created_at = created_at.to_pydatetime()

                    app_data = models.App(
                        id=int(row["id"]),
                        name=row["name"],
                        unit=row["unit"],
                        domain=row["domain"],
                        description=row["description"],
                        img_url=row["img_url"],
                        visits=int(row["visits"]),
                        promotion_times=int(row["promotion_times"]),
                        created_at=created_at
                    )
                    db.add(app_data)
                
                # 导入 Daily Stats
                try:
                    df_stats = pd.read_excel(excel_path, sheet_name="daily_stats")
                    for _, row in df_stats.iterrows():
                        stat_date = row.get("stat_date")
                        if isinstance(stat_date, str):
                            stat_date = datetime.strptime(stat_date, "%Y-%m-%d").date()
                        elif isinstance(stat_date, pd.Timestamp):
                            stat_date = stat_date.date()
                            
                        stat_data = models.AppDailyStat(
                            app_id=int(row["app_id"]),
                            stat_date=stat_date,
                            visits=int(row["visits"]),
                            visitors=int(row["visitors"])
                        )
                        db.add(stat_data)
                except Exception as e:
                    print(f"导入 daily_stats 失败或不存在: {e}")
                
                db.commit()
                print("数据库已通过 Excel 数据种子初始化")
    except Exception as e:
        print(f"数据注入失败: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_data()
    yield

app = FastAPI(lifespan=lifespan, title="Mall API", description="应用商城的后端 API")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/filters")
def get_filters(db: Session = Depends(get_db)):
    """获取所有可用的单位 (units) 和业务领域 (domains)"""
    units = [r[0] for r in db.query(models.App.unit).distinct().all()]
    domains = [r[0] for r in db.query(models.App.domain).distinct().all()]
    return {"units": units, "domains": domains}

@app.get("/api/apps", response_model=list[schemas.App])
def get_apps(
    unit: str = Query(None, description="按单位过滤"),
    domain: str = Query(None, description="按业务领域过滤"),
    search: str = Query(None, description="搜索应用名称"),
    db: Session = Depends(get_db)
):
    """根据过滤条件获取应用列表"""
    query = db.query(models.App)
    if unit:
        query = query.filter(models.App.unit == unit)
    if domain:
        query = query.filter(models.App.domain == domain)
    if search:
        query = query.filter(models.App.name.contains(search))
    return query.all()

@app.get("/api/ranking", response_model=list[schemas.App])
def get_ranking(db: Session = Depends(get_db)):
    """获取访问量排名前 15 的应用"""
    return db.query(models.App).order_by(models.App.visits.desc()).limit(15).all()

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """获取统计数据，用于图表展示"""
    now = datetime.now()
    
    # 基础统计
    total_apps = db.query(models.App).count()
    new_this_month = db.query(models.App).filter(
        extract("year", models.App.created_at) == now.year,
        extract("month", models.App.created_at) == now.month
    ).count()
    
    promotion_stats = db.query(func.sum(models.App.promotion_times)).scalar() or 0
    total_promoted_apps = db.query(models.App).filter(models.App.promotion_times > 0).count()
    visits_stats = db.query(func.sum(models.App.visits)).scalar() or 0
    
    # 计算上月日期范围
    first_day_of_current_month = now.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - pd.Timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    
    # 上月访问次数（求和）
    last_month_visits = db.query(func.sum(models.AppDailyStat.visits)).filter(
        models.AppDailyStat.stat_date >= first_day_of_last_month.date(),
        models.AppDailyStat.stat_date <= last_day_of_last_month.date()
    ).scalar() or 0
    
    # 上月访问人数（求和）
    last_month_visitors = db.query(func.sum(models.AppDailyStat.visitors)).filter(
        models.AppDailyStat.stat_date >= first_day_of_last_month.date(),
        models.AppDailyStat.stat_date <= last_day_of_last_month.date()
    ).scalar() or 0
    
    # 图表 1: 业务领域分布
    domain_dist = db.query(models.App.domain, func.count(models.App.id)).group_by(models.App.domain).all()
    domain_data = [{"domain": r[0], "count": r[1]} for r in domain_dist]
    
    # 图表 2: 单位分布
    unit_dist = db.query(models.App.unit, func.count(models.App.id)).group_by(models.App.unit).all()
    unit_data = [{"unit": r[0], "count": r[1]} for r in unit_dist]
    
    # 图表 3: 新增趋势（按月份，展示过去 12 个月的数据）
    trend_data = []
    for i in range(11, -1, -1):
        target_date = first_day_of_current_month - pd.DateOffset(months=i)
        year = target_date.year
        month = target_date.month
        
        count = db.query(models.App).filter(
            extract("year", models.App.created_at) == year,
            extract("month", models.App.created_at) == month
        ).count()
        
        trend_data.append({"month": f"{month:02d}", "count": count})
    
    return {
        "summary": {
            "total_apps": total_apps,
            "new_this_month": new_this_month,
            "promotion_stats": promotion_stats,
            "total_promoted_apps": total_promoted_apps,
            "visits_stats": visits_stats,
            "last_month_visits": last_month_visits,
            "last_month_visitors": last_month_visitors
        },
        "charts": {
            "domain_distribution": domain_data,
            "unit_distribution": unit_data,
            "new_trend": trend_data
        }
    }
