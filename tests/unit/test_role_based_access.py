import os
from datetime import datetime, timedelta

import jwt
from flask import Flask

from app.apis import register as register_api


os.environ.setdefault("JWT_KEY", "test-secret")
register_api.JWT_KEY = os.environ["JWT_KEY"]


def build_test_app():
    app = Flask(__name__)
    app.config["TESTING"] = True

    @app.route("/protected")
    @register_api.token_required
    @register_api.role_required("farmer")
    def protected():
        return {"ok": True}, 200

    return app


def make_token(role: str):
    return jwt.encode(
        {
            "user_id": "123",
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=2),
        },
        register_api.JWT_KEY,
        algorithm="HS256",
    )


def test_role_required_allows_matching_role():
    app = build_test_app()
    client = app.test_client()

    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {make_token('farmer')}"},
    )

    assert response.status_code == 200
    assert response.get_json() == {"ok": True}


def test_role_required_rejects_non_matching_role():
    app = build_test_app()
    client = app.test_client()

    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {make_token('buyer')}"},
    )

    assert response.status_code == 403
    assert response.get_json()["message"] == "Forbidden"
