from fastapi import FastAPI, Depends, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
import pandas as pd
import os
import shutil
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional
from pydantic import BaseModel
from jose import jwt, JWTError
from dotenv import load_dotenv

from database import engine, get_db, Base, SessionLocal
import models
import schemas

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

models.Base.metadata.create_all(bind=engine)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DEFAULT_EXCEL_PATH = os.path.join(DATA_DIR, "import_template.xlsx")
LATEST_EXCEL_PATH = os.path.join(DATA_DIR, "latest.xlsx")

JWT_SECRET_KEY = os.environ.get("MALL_JWT_SECRET", "mall-dev-secret")
JWT_ALGORITHM = "HS256"
AUTH_USERNAME = os.environ.get("MALL_ADMIN_USERNAME", "admin")
AUTH_PASSWORD = os.environ.get("MALL_ADMIN_PASSWORD", "admin123")
http_bearer = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    username: str
    password: str


def _create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "iat": int(datetime.utcnow().timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _require_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="未登录")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username != AUTH_USERNAME:
            raise HTTPException(status_code=401, detail="无效用户")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="无效 Token")


def _is_valid_import_excel(path: str) -> bool:
    try:
        xls = pd.ExcelFile(path)
        return "apps" in xls.sheet_names
    except Exception:
        return False


def _get_excel_path() -> Optional[str]:
    if os.path.exists(LATEST_EXCEL_PATH) and _is_valid_import_excel(LATEST_EXCEL_PATH):
        return LATEST_EXCEL_PATH
    if os.path.exists(DEFAULT_EXCEL_PATH) and _is_valid_import_excel(DEFAULT_EXCEL_PATH):
        return DEFAULT_EXCEL_PATH
    return None


def _seed_from_excel(excel_path: str, db: Session) -> None:
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
            link=row.get("link", ""),
            features=row.get("features", ""),
            visits=int(row.get("visits", 0)),
            data_amount=int(row.get("data_amount", 0)),
            created_at=created_at
        )
        db.add(app_data)

    try:
        df_monthly = pd.read_excel(excel_path, sheet_name="monthly_stats")
        for _, row in df_monthly.iterrows():
            month_value = row.get("month")
            if pd.isna(month_value):
                continue
            month_str = str(month_value)
            monthly_row = models.MallMonthlyStat(
                month=month_str,
                new_data_amount=int(row.get("new_data_amount", 0)),
                new_visitors=int(row.get("new_visitors", 0)),
            )
            db.add(monthly_row)
    except Exception as e:
        print(f"导入 monthly_stats 失败或不存在: {e}")


def seed_data():
    """读取 Excel 文件并在数据库为空时注入模拟数据"""
    db = SessionLocal()
    try:
        excel_path = _get_excel_path()
        if not excel_path:
            return

        try:
            apps_count = db.query(models.App).count()
            monthly_count = db.query(models.MallMonthlyStat).count()
        except Exception:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            apps_count = 0
            monthly_count = 0

        if apps_count == 0 and monthly_count == 0:
            _seed_from_excel(excel_path, db)
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


@app.post("/api/auth/login")
def login(req: LoginRequest):
    if req.username != AUTH_USERNAME or req.password != AUTH_PASSWORD:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = _create_access_token(req.username)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/filters")
def get_filters(db: Session = Depends(get_db)):
    """获取所有可用的单位 (units)、业务领域 (domains) 和特点 (features)
    单位和领域保持预定义顺序，仅显示数据库中实际存在的项"""
    # 预定义的显示顺序
    unit_order = ["市局", "一局", "二局", "三局", "东丽", "西青", "津南", "北辰", "滨海",
                  "宝坻", "武清", "蓟县", "静海", "宁河", "营销", "物流", "公路", "恒实"]
    domain_order = ["办公室", "计划", "专卖", "内管",  "法规", "财务",  "审计", "人事",
                    "党建", "纪检", "安保", "群团", "服务中心", "企管", "学会", "规范", "营销", "物流"]
    features = ["业务线上化", "业务规范化", "数据可视化", "管理协同", "系统对接"]

    # 查询数据库中实际存在的单位和领域
    existing_units = {r[0]
                      for r in db.query(models.App.unit).distinct() if r[0]}
    existing_domains = {r[0]
                        for r in db.query(models.App.domain).distinct() if r[0]}

    # 按预定义顺序过滤，仅保留库中存在的项；库中新增的未知项追加到末尾
    units = [u for u in unit_order if u in existing_units] + \
        sorted(existing_units - set(unit_order))
    domains = [d for d in domain_order if d in existing_domains] + \
        sorted(existing_domains - set(domain_order))
    return {"units": units, "domains": domains, "features": features}


@app.get("/api/apps", response_model=list[schemas.App])
def get_apps(
    unit: str = Query(None, description="按单位过滤"),
    domain: str = Query(None, description="按业务领域过滤"),
    feature: str = Query(None, description="按特点过滤"),
    search: str = Query(None, description="搜索应用名称"),
    db: Session = Depends(get_db)
):
    """根据过滤条件获取应用列表"""
    query = db.query(models.App)
    if unit:
        query = query.filter(models.App.unit == unit)
    if domain:
        query = query.filter(models.App.domain == domain)
    if feature:
        query = query.filter(models.App.features.contains(feature))
    if search:
        query = query.filter(models.App.name.contains(search))
    return query.all()


@app.get("/api/ranking")
def get_ranking(type: str = Query("comprehensive", description="排行榜类型：visits 或 comprehensive"), db: Session = Depends(get_db)):
    """获取排名前 10 的应用，支持综合榜和访问量榜"""
    if type == "visits":
        apps = db.query(models.App).order_by(
            models.App.visits.desc()).limit(10).all()
    else:
        apps = db.query(models.App).order_by(
            models.App.data_amount.desc()).limit(10).all()
    return apps


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

    visits_total = db.query(func.sum(models.App.visits)).scalar() or 0
    total_data_amount = db.query(
        func.sum(models.App.data_amount)).scalar() or 0

    first_day_of_current_month = now.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - pd.Timedelta(days=1)
    last_month_str = last_day_of_last_month.strftime("%Y-%m")

    last_month_new_data_amount = db.query(models.MallMonthlyStat.new_data_amount).filter(
        models.MallMonthlyStat.month == last_month_str
    ).scalar() or 0
    last_month_visitors = db.query(models.MallMonthlyStat.new_visitors).filter(
        models.MallMonthlyStat.month == last_month_str
    ).scalar() or 0

    # 图表 1: 业务领域分布
    domain_dist = db.query(models.App.domain, func.count(models.App.id)).group_by(
        models.App.domain).order_by(func.count(models.App.id).desc()).all()
    domain_data = [{"domain": r[0], "count": r[1]} for r in domain_dist]

    # 图表 2: 单位分布
    unit_dist = db.query(models.App.unit, func.count(models.App.id)).group_by(
        models.App.unit).order_by(func.count(models.App.id).desc()).all()
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
            "data_total": total_data_amount,
            "last_month_new_data": last_month_new_data_amount,
            "visits_total": visits_total,
            "last_month_visitors": last_month_visitors
        },
        "charts": {
            "domain_distribution": domain_data,
            "unit_distribution": unit_data,
            "new_trend": trend_data
        }
    }


@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...), user: str = Depends(_require_user)):
    os.makedirs(DATA_DIR, exist_ok=True)
    filename = file.filename or ""
    if not filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx 文件")

    with open(LATEST_EXCEL_PATH, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    try:
        try:
            db.query(models.MallMonthlyStat).delete()
            db.query(models.App).delete()
            db.commit()
        except Exception:
            db.rollback()
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        _seed_from_excel(LATEST_EXCEL_PATH, db)
        db.commit()
        apps_count = db.query(models.App).count()
        monthly_count = db.query(models.MallMonthlyStat).count()
        return {"message": "上传成功，数据库已刷新", "apps": apps_count, "monthly_stats": monthly_count}
    finally:
        db.close()
