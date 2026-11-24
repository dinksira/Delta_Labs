"""System-admin identity operations."""

from __future__ import annotations

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.security import PasswordPolicyError, hash_password, validate_password_policy
from app.domain.identity.repository import Repository
from app.domain.identity.schemas import (
    AdminSessionRevokeResponse,
    AdminUserCreateRequest,
    AdminUserDetail,
    AdminUserListItem,
    AdminUserListResponse,
    AdminUserStatusUpdate,
    UserRecord,
)


# ################################ SERVICE ################################
# Platform-admin user lifecycle (listing, activation, session revocation).
class AdminUserService:
    """Administrative operations over user accounts and sessions."""

    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    async def list_users(
        self,
        *,
        query: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> AdminUserListResponse:
        records, total = await self._repository.list_users(
            query=query,
            is_active=is_active,
            page=page,
            page_size=page_size,
        )
        total_pages = (total + page_size - 1) // page_size if total else 0
        return AdminUserListResponse(
            items=[self._to_list_item(record) for record in records],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_user(self, *, user_id: str) -> AdminUserDetail:
        record = await self._require_user(user_id=user_id)
        return await self._to_detail(record)

    async def create_user(self, *, payload: AdminUserCreateRequest) -> AdminUserDetail:
        username = payload.username.strip()
        email = payload.email.strip().lower() if payload.email else None
        phone_e164 = payload.phone_e164.strip() if payload.phone_e164 else None
        full_name = payload.full_name.strip() if payload.full_name else None

        if not username:
            raise ValidationError("Username is required.", code="invalid_username")
        if not email and not phone_e164:
            raise ValidationError(
                "Email or phone number is required.",
                code="contact_required",
            )

        try:
            validate_password_policy(payload.password)
        except PasswordPolicyError as exc:
            raise ValidationError(str(exc), code="password_policy_failed") from exc

        if await self._repository.find_user_by_identity(username):
            raise ConflictError("Username already exists.", code="username_already_exists")
        if email and await self._repository.find_user_by_identity(email):
            raise ConflictError("Email already exists.", code="email_already_exists")
        if phone_e164 and await self._repository.find_user_by_identity(phone_e164):
            raise ConflictError("Phone number already exists.", code="phone_already_exists")

        record = await self._repository.create_user_with_password(
            username=username,
            email=email,
            phone_e164=phone_e164,
            password_hash=hash_password(payload.password),
            full_name=full_name,
            is_active=payload.is_active,
            is_verified=payload.is_verified,
        )
        return await self._to_detail(record)

    async def set_user_active(
        self,
        *,
        actor_user_id: str,
        user_id: str,
        payload: AdminUserStatusUpdate,
    ) -> AdminUserDetail:
        if actor_user_id == user_id and not payload.is_active:
            raise ValidationError(
                "You cannot deactivate your own account.",
                code="self_deactivation_forbidden",
            )

        await self._require_user(user_id=user_id)
        await self._repository.set_user_active(user_id=user_id, is_active=payload.is_active)
        if not payload.is_active:
            await self._repository.revoke_all_sessions_for_user(user_id)

        updated = await self._require_user(user_id=user_id)
        return await self._to_detail(updated)

    async def revoke_sessions(self, *, user_id: str) -> AdminSessionRevokeResponse:
        await self._require_user(user_id=user_id)
        revoked = await self._repository.revoke_all_sessions_for_user(user_id)
        return AdminSessionRevokeResponse(user_id=user_id, revoked_sessions=revoked)

    async def _require_user(self, *, user_id: str) -> UserRecord:
        record = await self._repository.find_user_by_id(user_id)
        if record is None:
            raise NotFoundError("User not found.", code="user_not_found")
        return record

    async def _to_detail(self, record: UserRecord) -> AdminUserDetail:
        active_sessions = await self._repository.count_active_sessions(user_id=record.id)
        last_session_at = await self._repository.find_latest_session_at(user_id=record.id)
        return AdminUserDetail(
            user_id=record.id,
            username=record.username,
            full_name=record.full_name,
            email=record.email,
            phone_e164=record.phone_e164,
            is_active=record.is_active,
            is_verified=record.is_verified,
            created_at=record.created_at,
            updated_at=record.updated_at,
            bio=record.bio,
            avatar_url=record.avatar_url,
            active_sessions=active_sessions,
            last_session_at=last_session_at,
        )

    @staticmethod
    def _to_list_item(record: UserRecord) -> AdminUserListItem:
        return AdminUserListItem(
            user_id=record.id,
            username=record.username,
            full_name=record.full_name,
            email=record.email,
            phone_e164=record.phone_e164,
            is_active=record.is_active,
            is_verified=record.is_verified,
            created_at=record.created_at,
        )


# ################################ /SERVICE ################################
