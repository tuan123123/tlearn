# Tlearn

Tlearn is an AI learning platform MVP. The backend uses FastAPI and will grow one small feature at a time.

## Run the backend

The backend requires Python 3.11 or newer.

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/health` to check that the API is running. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

Run the tests from the `backend` directory:

```powershell
pytest
```

Local settings belong in `backend/.env`. This file is ignored by Git. When a new setting is introduced, document its name with a safe example in `backend/.env.example`, but never put a real secret there.

