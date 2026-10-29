# FM LUXE API

This directory contains the standalone FastAPI backend. Phase 1 exposes only
the versioned health contract and database readiness check; the existing
Supabase-backed storefront remains active until later phases.

## Local setup

1. Create a Python 3.12 virtual environment in `backend/.venv`.
2. Install the project with `python -m pip install -e ".[dev]"` from this directory.
3. Run `neon login` and `neon deploy` from the repository root to pull Neon
   variables into the root `.env.local` (or `.env` when it exists). The backend
   reads these files automatically. A `backend/.env` file can override them.
   Set `BACKEND_URL=http://127.0.0.1:8000` in the root environment file for Next.js.
4. Start the API with `python -m app`. This selects a psycopg-compatible
   event loop on Windows. On Linux hosting, Uvicorn's default loop also works.
5. Start Next.js from the repository root with `pnpm dev`.

The browser-facing health endpoint is `http://localhost:4000/api/health`.
FastAPI documentation is available at `http://localhost:8000/docs` in local
development.

## Database and tests

- Check the migration state with `python -m alembic current`.
- Create future migrations with `python -m alembic revision --autogenerate -m "description"`.
- Run backend tests with `python -m pytest`.

Do not commit `.env`, Neon credentials, or the virtual environment.
