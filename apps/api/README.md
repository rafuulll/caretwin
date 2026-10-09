# apps/api (FastAPI)

Deploy na Railway com Root Directory = apps/api.

Primeiros passos (quando for criar o projeto):
  python -m venv .venv
  pip install fastapi "uvicorn[standard]" pydantic-settings supabase
  uvicorn app.main:app --reload

O FastAPI gera o OpenAPI sozinho em /openapi.json. Exporte e commite em ../../docs/openapi.yaml a cada mudanca de endpoint.
Endpoints iniciais: ver docs/openapi.yaml (v1 da pulseira).
