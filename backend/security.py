from datetime import datetime, timedelta, timezone
from typing import Optional, List
import bcrypt
# Monkey patch para compatibilidad con bcrypt >= 4.0.0
if not hasattr(bcrypt, '__about__'):
    try:
        class About:
            __version__ = bcrypt.__version__
        bcrypt.__about__ = About()
    except Exception:
        pass

from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from config import settings
import models
from database import SessionLocal

# Contexto para hashear contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema de autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que una contraseña en texto plano coincida con un hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    """Autentica un usuario verificando email y contraseña."""
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, roles: List[str] = [], expires_delta: Optional[timedelta] = None):
    """Crea un nuevo token de acceso, incluyendo roles."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "roles": roles})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Dependencias ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> models.Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            print("Debug: Token payload missing 'sub'")
            raise credentials_exception
    except JWTError as e:
        print(f"Debug: JWT validation failed: {e}")
        raise credentials_exception
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not user:
        print(f"Debug: User not found for email: {email}")
        raise credentials_exception
    return user

def require_role(required_role: str):
    """Crea una dependencia que verifica el rol del usuario."""
    def role_checker(current_user: models.Usuario = Depends(get_current_user)) -> models.Usuario:
        if required_role not in current_user.roles.split(","):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene los permisos necesarios"
            )
        return current_user
    return role_checker

