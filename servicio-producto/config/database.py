from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
#PONER .env
engine = create_engine("sqlite:///./producto.db")

SessionLocal = sessionmaker(
    autoflush = False,
    autocommit = False,
    bind = engine
)

Base = declarative_base()

def obtener_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

