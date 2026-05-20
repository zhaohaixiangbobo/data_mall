from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class App(Base):
    __tablename__ = "apps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit = Column(String, index=True)
    domain = Column(String, index=True)
    description = Column(String)
    img_url = Column(String)
    link = Column(String)
    features = Column(String)
    visits = Column(Integer, default=0)
    data_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # daily_stats = relationship("AppDailyStat", back_populates="app")

# class AppDailyStat(Base):
#     __tablename__ = "app_daily_stats"

#     id = Column(Integer, primary_key=True, index=True)
#     app_id = Column(Integer, ForeignKey("apps.id"))
#     stat_date = Column(Date, index=True)
#     visits = Column(Integer, default=0)
#     visitors = Column(Integer, default=0)

#     app = relationship("App", back_populates="daily_stats")

class MallMonthlyStat(Base):
    __tablename__ = "mall_monthly_stats"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, unique=True, index=True)
    new_data_amount = Column(Integer, default=0)
    new_visitors = Column(Integer, default=0)
