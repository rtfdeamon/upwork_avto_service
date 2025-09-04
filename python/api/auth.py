import os
import bcrypt
import jwt
from datetime import datetime, timedelta


JWT_SECRET = os.getenv('JWT_SECRET', 'secret')


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def make_token(sub: str, email: str, role: str) -> str:
    payload = {
        'sub': sub,
        'email': email,
        'role': role,
        'iat': int(datetime.utcnow().timestamp()),
        'exp': int((datetime.utcnow() + timedelta(days=7)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except Exception:
        return None

