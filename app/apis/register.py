from app.db import DB
from flask_restx import Namespace, Resource, fields
from flask import request
from http import HTTPStatus
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.apis import MSG
from app.db.userreg import add_user, login_user
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file
JWT_KEY=os.getenv('JWT_KEY')

register_ns = Namespace("register", description="User registration operations")

user_model = register_ns.model( "User",{
    "username":fields.String(required=True, description="The username of the user"),
    "email":fields.String(required=True, description="The email of the user"),
    "password":fields.String(required=True, description="The password of the user"),
    "role":fields.Boolean(required=True, description="The role of the user")
})

login_model = register_ns.model("Login", {
    "email": fields.String(required=True, description="The email of the user"),
    "password": fields.String(required=True, description="The password of the user")
})

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return {"message": "Token is missing"}, 401
        token = token.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_KEY, algorithms=["HS256"])
            request.user_id = payload["user_id"]
        except jwt.ExpiredSignatureError:
            return {"message": "Token has expired"}, 401
        except jwt.InvalidTokenError:
            return {"message": "Invalid token"}, 401
        return f(*args, **kwargs)
    return decorated


@register_ns.route("/register")
class Register(Resource):
    @register_ns.expect(user_model)
    def post(self):
        data = request.json
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        role = data.get("role")

        user_id = add_user(username, password, email, role)
        if isinstance(user_id, dict):
            return user_id, HTTPStatus.CONFLICT

        return {"message": "User registered successfully", "user_id": user_id}, HTTPStatus.CREATED


@register_ns.route("/login")
class Login(Resource):
    @register_ns.expect(login_model)
    def post(self):
        data = request.json
        email = data.get("email")
        password = data.get("password")

        user = login_user(email, password)
        if not user:
            return {"message": "Invalid email or password"}, HTTPStatus.UNAUTHORIZED

        token = jwt.encode({
            "user_id": str(user["_id"]),
            "exp": datetime.now() + timedelta(hours=2)
        }, JWT_KEY, algorithm="HS256")

        return {"token": token}, HTTPStatus.OK

