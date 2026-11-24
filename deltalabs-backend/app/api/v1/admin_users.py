"""System-admin user management endpoints."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import CurrentUser, get_db
from app.api.deps_authz import require_system_admin
from app.domain.identity.admin_service import AdminUserService
from app.domain.identity.repository import Repository
from app.domain.identity.schemas import (
    AdminSessionRevokeResponse,
    AdminUserCreateRequest,
    AdminUserDetail,
    AdminUserListResponse,
    AdminUserStatusUpdate,
)

# ################################ CONSTANTS ################################
router = APIRouter(prefix="/admin/users", tags=["admin-users"])
# ################################ /CONSTANTS ################################


# ################################ HELPERS ################################
def _service(db: AsyncIOMotorDatabase[dict[str, object]]) -> AdminUserService:
    return AdminUserService(Repository(db))


# ################################ /HELPERS ################################


# ################################ ROUTES ################################
@router.get("", response_model=AdminUserListResponse)
async def list_admin_users(
    q: str | None = Query(default=None, max_length=200),
    status_filter: Literal["active", "inactive", "all"] = Query(default="all", alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    _admin: CurrentUser = Depends(require_system_admin),  # noqa: B008
    db: AsyncIOMotorDatabase[dict[str, object]] = Depends(get_db),  # noqa: B008
) -> AdminUserListResponse:
    """List accounts with optional text search and status filter."""
    is_active = None if status_filter == "all" else status_filter == "active"
    service = _service(db)
    return await service.list_users(
        query=q,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=AdminUserDetail, status_code=201)
async def create_admin_user(
    payload: AdminUserCreateRequest,
    _admin: CurrentUser = Depends(require_system_admin),  # noqa: B008
    db: AsyncIOMotorDatabase[dict[str, object]] = Depends(get_db),  # noqa: B008
) -> AdminUserDetail:
    """Create a new platform account."""
    service = _service(db)
    return await service.create_user(payload=payload)


@router.get("/{user_id}", response_model=AdminUserDetail)
async def get_admin_user(
    user_id: str,
    _admin: CurrentUser = Depends(require_system_admin),  # noqa: B008
    db: AsyncIOMotorDatabase[dict[str, object]] = Depends(get_db),  # noqa: B008
) -> AdminUserDetail:
    """Fetch a single account with session metadata."""
    service = _service(db)
    return await service.get_user(user_id=user_id)


@router.patch("/{user_id}/status", response_model=AdminUserDetail)
async def update_admin_user_status(
    user_id: str,
    payload: AdminUserStatusUpdate,
    admin: CurrentUser = Depends(require_system_admin),  # noqa: B008
    db: AsyncIOMotorDatabase[dict[str, object]] = Depends(get_db),  # noqa: B008
) -> AdminUserDetail:
    """Activate or deactivate an account (deactivation revokes sessions)."""
    service = _service(db)
    return await service.set_user_active(
        actor_user_id=admin.user_id,
        user_id=user_id,
        payload=payload,
    )


@router.post("/{user_id}/sessions/revoke", response_model=AdminSessionRevokeResponse)
async def revoke_admin_user_sessions(
    user_id: str,
    _admin: CurrentUser = Depends(require_system_admin),  # noqa: B008
    db: AsyncIOMotorDatabase[dict[str, object]] = Depends(get_db),  # noqa: B008
) -> AdminSessionRevokeResponse:
    """Revoke every active session for an account."""
    service = _service(db)
    return await service.revoke_sessions(user_id=user_id)


# ################################ /ROUTES ################################
