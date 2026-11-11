from sqlalchemy import crate_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("sqlite:///./producto.db")