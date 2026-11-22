"""Opt-in real Neon verification. Codes are entered privately; passwords stay in memory.

Run from backend/: python tests/auth_live_probe.py customer+unique-qa@gmail.com
Creates one QA identity. Never use an existing customer's address.
"""
import asyncio
import getpass
import secrets
import sys

from httpx import ASGITransport, AsyncClient

from app.core.event_loop import new_event_loop
from app.core.config import get_settings
from app.main import app


async def probe(email: str, reset_existing: bool = False):
    if get_settings().app_env not in {"development", "test"}:
        raise SystemExit("The live QA probe is disabled outside development/test.")
    password = secrets.token_urlsafe(32)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8000") as client:
        async def post(path: str, payload: dict):
            csrf = await client.get("/v1/auth/csrf")
            assert csrf.status_code == 200, f"CSRF failed: {csrf.status_code}"
            response = await client.post("/v1/auth/" + path, json=payload,
                headers={"X-CSRF-Token": csrf.json()["data"]["csrf_token"]})
            code = response.json().get("error", {}).get("code", "OK")
            print(f"POST {path}: HTTP {response.status_code} {code}", flush=True)
            return response

        async def reset_to(value: str):
            assert (await post("password-reset/request", {"email": email})).status_code == 200
            print(f"Reset email requested for {email}.", flush=True)
            code = await asyncio.to_thread(getpass.getpass, "Password-reset code: ")
            payload = {"email": email, "code": code.strip(), "password": value}
            reset_result = await post("password-reset/confirm", payload)
            if reset_result.status_code == 503:
                # A timed-out provider write may have succeeded. Keep the password in memory.
                print("Checking whether the reset applied despite the unavailable response.", flush=True)
                assert (await post("login", {"email": email, "password": value})).status_code == 200
            else:
                assert reset_result.status_code == 200
                assert (await post("password-reset/confirm", payload)).status_code in {400, 403}

        if reset_existing:
            await reset_to(password)
        else:
            signup = await post("signup", {"name": "Authentication QA", "email": email, "password": password})
            assert signup.status_code == 200
            assert (await post("email-verification/request", {"email": email})).status_code == 200
            print(f"Verification email requested for {email}.", flush=True)
            code = await asyncio.to_thread(getpass.getpass, "Verification code: ")
            verified = await post("email-verification/confirm", {"email": email, "code": code.strip()})
            assert verified.status_code == 200
            replay = await post("email-verification/confirm", {"email": email, "code": code.strip()})
            assert replay.status_code in {400, 403}
        signed_in = await post("login", {"email": email, "password": password})
        assert signed_in.status_code == 200
        assert signed_in.json()["data"]["profile"]["role"] == "customer"
        for path, status in [("auth/session", 200), ("auth/me", 200), ("admin/auth-check", 403)]:
            response = await client.get("/v1/" + path)
            print(f"GET {path}: HTTP {response.status_code}", flush=True)
            assert response.status_code == status
        assert (await post("logout", {})).status_code == 200
        response = await client.get("/v1/auth/session")
        assert response.status_code == 401
        print("GET auth/session after logout: HTTP 401", flush=True)
        if not reset_existing:
            new_password = secrets.token_urlsafe(32)
            await reset_to(new_password)
            assert (await post("login", {"email": email, "password": password})).status_code == 401
            assert (await post("login", {"email": email, "password": new_password})).status_code == 200
            assert (await post("logout", {})).status_code == 200
        print("REAL_NEON_AUTH_FLOW_PASSED; passwords and cookies were never printed.", flush=True)


if __name__ == "__main__":
    if len(sys.argv) not in {2, 3} or "+" not in sys.argv[1]:
        raise SystemExit("Supply a fresh +alias email for the disposable QA identity.")
    with asyncio.Runner(loop_factory=new_event_loop) as runner:
        runner.run(probe(sys.argv[1], reset_existing="--reset-existing" in sys.argv))
