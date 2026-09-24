from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import motor.motor_asyncio
import redis.asyncio as redis
from app.config import settings
import logging

logger = logging.getLogger("airprice.database")

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite+aiosqlite:///"):
    db_url = db_url.replace("sqlite:///", "sqlite+aiosqlite:///")
elif db_url.startswith("sqlite://") and not db_url.startswith("sqlite+aiosqlite://"):
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")

# SQLAlchemy Async Engine (PostgreSQL / TimescaleDB / SQLite)
engine_kwargs = {"echo": False, "future": True}
if not db_url.startswith("sqlite"):
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(db_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# MongoDB Async Client
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]

# Redis Async Client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_db():
    """Dependency for obtaining async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def check_db_health():
    """Health check for PostgreSQL, MongoDB, and Redis."""
    status = {"postgresql": False, "mongodb": False, "redis": False}
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
            status["postgresql"] = True
    except Exception as e:
        logger.warning(f"PostgreSQL health check failed: {e}")

    try:
        await mongo_client.admin.command('ping')
        status["mongodb"] = True
    except Exception as e:
        logger.warning(f"MongoDB health check failed: {e}")

    try:
        await redis_client.ping()
        status["redis"] = True
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")

    return status
