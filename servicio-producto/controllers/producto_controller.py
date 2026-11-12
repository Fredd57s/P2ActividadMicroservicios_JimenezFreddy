from sqlalchemy.orm import Session
from models.producto import Producto
from schemas.producto import ProductoCreate

def obtener_productos(db : Session):
    return db.query(Producto).all

def obtener_productos_id(db : Session, codigo : int):
    return db.query(Producto).filter(Producto.codigo == codigo).first()

#Crear Producto
def crear_producto(db: Session, datos: ProductoCreate):
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto

#Actualizar
def actualizar_producto(db: Session, codigo: int, datos: ProductoCreate):
    producto = obtener_productos_id(db, codigo)
    if producto is None:
        return None

    producto.nombre = datos.nombre
    producto.descripcion = datos.descripcion
    producto.precio = datos.precio
    producto.stock = datos.stock

    db.commit()
    db.refresh(producto)
    return producto

def eliminar_producto(db: Session, codigo : int):
    producto = obtener_productos_id(db,codigo)
    if not producto : 
        return None
    db.delete(producto)
    db.commit()

    return producto
    