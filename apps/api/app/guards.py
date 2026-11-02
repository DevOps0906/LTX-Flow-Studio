"""로컬 전용 가드(04_API.md#5): DNS 리바인딩(Host)·CSRF(Origin) 차단. 가장 바깥 미들웨어로 둔다."""

from collections.abc import Iterable

from starlette.types import ASGIApp, Receive, Scope, Send

from app.errors import error_response

ALLOWED_HOSTS = frozenset({"127.0.0.1", "localhost"})
UNSAFE_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


def host_allowed(host: str) -> bool:
    """허용 목록과 정확히 일치해야 한다. 포트는 숫자만 허용(evil.localhost·localhost. 거부)."""
    name, sep, port = host.partition(":")
    if sep:
        if not port.isascii() or not port.isdigit() or len(port) > 5:
            return False
        if not 0 < int(port) < 65536:
            return False
    return name in ALLOWED_HOSTS


def _header_values(scope: Scope, name: bytes) -> list[str]:
    return [value.decode("latin-1") for key, value in scope["headers"] if key == name]


class LocalGuardMiddleware:
    def __init__(self, app: ASGIApp, allowed_origins: Iterable[str]) -> None:
        self.app = app
        self.allowed_origins = frozenset(allowed_origins)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        hosts = _header_values(scope, b"host")
        if len(hosts) != 1 or not host_allowed(hosts[0]):
            response = error_response(400, "host_not_allowed", "허용되지 않은 Host입니다")
            await response(scope, receive, send)
            return

        if scope["method"] in UNSAFE_METHODS:
            # Origin 없음은 비브라우저 로컬 도구(curl 등)로 보고 허용한다. `null`·외부 출처는 거부.
            origins = _header_values(scope, b"origin")
            if origins and (len(origins) != 1 or origins[0] not in self.allowed_origins):
                response = error_response(403, "origin_not_allowed", "허용되지 않은 출처입니다")
                await response(scope, receive, send)
                return

        await self.app(scope, receive, send)
