# Tlearn

Tlearn is an AI learning platform MVP. Phase 1 is a local Microeconomics AI Exam Coach foundation with FastAPI, MongoDB, JWT auth, and a React/Vite/TypeScript frontend.

## Requirements

- Python 3.11 or newer
- Node.js 20 or newer
- MongoDB running locally on `mongodb://localhost:27017`

## Run the backend

Open PowerShell:

```powershell
cd C:\Users\Tuan\tlearn\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend\.env` and replace `JWT_SECRET` with your own long random value.

Then start the API:

```powershell
uvicorn main:app --reload
```

Check these URLs:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Run the frontend

Open a second PowerShell window:

```powershell
cd C:\Users\Tuan\tlearn\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`.

To try Phase 2 uploads:

1. Register or log in.
2. Create a Microeconomics course.
3. Click the course card on the dashboard.
4. Upload a `.pdf` or `.pptx` file from `/courses/:id/setup`.
5. Watch the file status move from waiting/processing to ready.

Uploaded files are saved locally under `uploads\`. This folder is ignored by Git.

## Run checks

Backend tests:

```powershell
cd C:\Users\Tuan\tlearn\backend
.\.venv\Scripts\python.exe -m pytest
```

Frontend build:

```powershell
cd C:\Users\Tuan\tlearn\frontend
npm run build
```

## Phase 2 upload behavior

The backend accepts PDF and PPTX files up to 20MB.

When you upload a file:

1. FastAPI saves it to `uploads\{user_id}\{course_id}\...`.
2. MongoDB gets an `uploaded_files` document with `extraction_status = "pending"`.
3. A background task extracts text.
4. The same MongoDB document is updated with:
   - `extracted_text`
   - `page_refs`
   - `extraction_status = "done"` or `"failed"`

DOCX is mentioned in the product goal, but Phase 2 currently rejects it because the detailed extraction spec only defined PDF/PPTX page and slide extraction.

## Environment variables

Backend variables live in `backend\.env`:

- `MONGODB_URL`: MongoDB server URL
- `MONGODB_DB_NAME`: database name
- `JWT_SECRET`: secret key used to sign JWTs
- `JWT_EXPIRE_MINUTES`: how long login tokens last
- `FRONTEND_URL`: production frontend URL for CORS
- `ENVIRONMENT`: use `development` locally

Frontend variables live in `frontend\.env`:

- `VITE_API_URL`: backend API URL, usually `http://127.0.0.1:8000`

Never commit real secrets. Use `.env.example` only for safe placeholder values.
