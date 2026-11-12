from sqlalchemy import crate_engine
from sqlalchemy.orm import sessionmaker, declarative_base

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
    except:
        print("Ocurrió un error en la captura de datos")
    finally:
        db.close()

