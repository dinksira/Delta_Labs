"""HTTP contract tests for system-admin user endpoints."""

from app.main import app
from fastapi.testclient import TestClient


def test_admin_users_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.get("/v1/admin/users")
    assert response.status_code == 401


def test_admin_users_routes_are_registered() -> None:
    paths = app.openapi()["paths"]
    assert "post" in paths["/v1/admin/users"]
    assert "/v1/admin/users/{user_id}" in paths
    assert "/v1/admin/users/{user_id}/status" in paths
    assert "/v1/admin/users/{user_id}/sessions/revoke" in paths
