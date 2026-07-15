from app.db.utils import serialize_item, serialize_items
from app.db import DB
from bson.objectid import ObjectId
from http import HTTPStatus
from datetime import datetime,timedelta,date,time
from werkzeug.security import generate_password_hash, check_password_hash

def _get_user_collection():
    return DB.get_collection("users")

def add_user(username: str, password: str, email: str, role: str) -> dict:
    users_col = _get_user_collection()
    if get_user_by_email(email):
        return {"message": "Email already exists"}
    hashed_pw = generate_password_hash(password)
    normalized_role = (role or "buyer").strip().lower()
    user_data = {
        "username": username,
        "password": hashed_pw,
        "email": email,
        "role": normalized_role
    }
    result = users_col.insert_one(user_data)
    return str(result.inserted_id)

def get_user_by_email(email: str) -> dict | None:
    users_col = _get_user_collection()
    user = users_col.find_one({"email": email})
    if user:
        return serialize_item(user)
    return None

def login_user(email: str, password: str) -> dict | None:
    users_col = _get_user_collection()
    user = get_user_by_email(email)
    if user and check_password_hash(user["password"], password):
        return serialize_item(user)
    return None
