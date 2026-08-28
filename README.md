# Tlearn

> A bilingual, AI-assisted Microeconomics exam coach that turns course materials into focused practice, diagnostic feedback, and personalized study plans.

[Live application](https://tlearn-web-bj5mphzx7q-uc.a.run.app) · [API documentation](https://tlearn-api-bj5mphzx7q-uc.a.run.app/docs) · [API health](https://tlearn-api-bj5mphzx7q-uc.a.run.app/health)

## Overview

Tlearn helps students move from passive course materials to active exam preparation. Students upload their Microeconomics notes or slides, review AI-extracted topics, complete diagnostic quizzes and mock exams, and receive evidence-based reports showing their weak topics, skills, and Bloom's taxonomy levels.

The application supports English and Vietnamese throughout the learning flow. A student's registration location sets the initial language, while the interface also provides a manual language control.

## Key capabilities

- **Secure accounts and courses** — JWT authentication and user-owned course workspaces.
- **Course-material ingestion** — PDF and PPTX uploads up to 20 MB, with page- or slide-level text extraction.
- **AI topic review** — maps English or Vietnamese course content to a controlled Microeconomics topic set and preserves source evidence.
- **Diagnostic quizzes** — generates questions across topics, skills, and Bloom levels without exposing answers before submission.
- **Weakness analysis** — reports topic accuracy, response time, skill gaps, Bloom-level performance, and question-by-question feedback.
- **Personalized study guides** — creates targeted revision plans from a student's latest performance.
- **Mock exams and progress tracking** — timed practice, readiness indicators, score history, and trend visualizations.
- **Bilingual, accessible interface** — English/Vietnamese content, responsive layouts, and light/dark themes.
- **Feedback collection** — accepts contextual feedback from authenticated or anonymous visitors, with rate limiting and admin triage endpoints.

## Architecture

```text
React + Vite client
        |
        v
FastAPI API ---------> MongoDB Atlas
    |   |------------> OpenAI API
    |   `------------> Local storage or Google Cloud Storage
    |
    `----> Cloud Tasks ----> Private extraction worker
```

Local development uses filesystem storage and in-process background extraction. The production deployment uses Cloud Run, Cloud Storage, Cloud Tasks, Secret Manager, a private worker service, and static outbound traffic through Cloud NAT.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Recharts, Tailwind CSS |
| Backend | Python 3.12, FastAPI, Pydantic, Motor |
| Database | MongoDB / MongoDB Atlas |
| AI | OpenAI Python SDK |
| File extraction | PyMuPDF, python-pptx |
| Authentication | JWT with password hashing |
| Production infrastructure | Docker, Google Cloud Run, Cloud Storage, Cloud Tasks, Secret Manager, VPC, Cloud NAT |
| Testing | Pytest, TypeScript compiler, Vite production build |

## Repository structure

```text
tlearn/
├── backend/
│   ├── api/routes/       # HTTP endpoints and request dependencies
│   ├── core/             # Configuration, database, security, and error handling
│   ├── models/           # MongoDB document shapes
│   ├── repositories/     # Database access
│   ├── schemas/          # Pydantic request and response validation
│   ├── services/         # Business logic and AI workflows
│   ├── tests/            # Backend test suite
│   ├── main.py           # Public FastAPI application
│   └── worker_main.py    # Private extraction-worker application
├── frontend/
│   └── src/
│       ├── api/          # Typed API client functions
│       ├── components/   # Reusable interface components
│       ├── hooks/        # Data-fetching hooks
│       ├── pages/        # Route-level screens
│       └── store/        # Authentication and theme state
├── AGENTS.md             # Repository development guidelines
└── README.md
```

## Local development

### Prerequisites

- Python 3.12
- Node.js 22 and npm
- MongoDB Atlas connection string or a local MongoDB instance
- OpenAI API key for AI-powered workflows

### 1. Configure and run the backend

From the repository root in PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Edit `backend/.env` and provide at least these values:

```env
MONGODB_URL=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/
MONGODB_DB_NAME=tlearn
JWT_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=replace-with-your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

Start the API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Using the virtual environment's Python executable directly avoids PowerShell execution-policy issues. The local API is available at:

- API: `http://127.0.0.1:8000`
- Interactive documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 2. Configure and run the frontend

Open a second PowerShell window from the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The default `frontend/.env` points to the local API:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Open `http://localhost:5173` in a browser.

## Configuration

Secrets belong in local `.env` files or a managed secret store; never commit them to source control. Both `.env` files are ignored by Git.

### Backend settings

| Variable | Purpose | Local default |
| --- | --- | --- |
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Application database | `tlearn` |
| `JWT_SECRET` | Signs authentication tokens | No safe production default |
| `JWT_EXPIRE_MINUTES` | Login-token lifetime | `60` |
| `FRONTEND_URL` | Allowed production CORS origin | `http://localhost:5173` |
| `OPENAI_API_KEY` | Authorizes AI workflows | Empty |
| `OPENAI_TOPIC_MODEL` | Model used by AI services | `gpt-5.4-mini` |
| `STORAGE_BACKEND` | `local` or `gcs` file storage | `local` |
| `TASK_QUEUE_BACKEND` | `local` or `gcp` extraction scheduling | `local` |
| `GCS_UPLOAD_BUCKET` | Production upload bucket | Empty |
| `GCP_PROJECT_ID` | Google Cloud project identifier | Empty |

See `backend/.env.example` for the complete infrastructure configuration, including Cloud Tasks and database timeout settings.

### Frontend settings

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Public base URL of the FastAPI service |

Vite embeds frontend environment variables at build time. Rebuild the frontend image whenever `VITE_API_URL` changes.

## Docker

Build and run the backend:

```powershell
docker build -t tlearn-api ./backend
docker run --rm --env-file ./backend/.env -p 8000:8080 tlearn-api
```

Build and run the frontend against the local API:

```powershell
docker build --build-arg VITE_API_URL=http://localhost:8000 -t tlearn-web ./frontend
docker run --rm -p 5173:8080 tlearn-web
```

If MongoDB runs directly on the Windows host, use `host.docker.internal` instead of `localhost` in the backend container's `MONGODB_URL`.

## Quality checks

Run backend tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

Run the frontend type check and production build:

```powershell
cd frontend
npm run build
```

Before committing a feature, review the working tree:

```powershell
git status --short
git diff --check
git diff
```

## Production deployment

The current production environment runs in Google Cloud region `us-central1`:

- The frontend and public API run as separate Cloud Run services.
- File uploads are stored in Cloud Storage.
- Cloud Tasks sends authenticated extraction jobs to a private Cloud Run worker.
- Secret Manager supplies the MongoDB URL, JWT secret, and OpenAI API key.
- Direct VPC egress and Cloud NAT provide a fixed outbound IP for the MongoDB Atlas access list.

Production secrets must not be passed as Docker build arguments or stored in container images. Grant each service account access only to the resources it needs.

## Security notes

- Uploaded files are scoped to the authenticated user and course.
- Protected routes verify JWT ownership before returning course data.
- Quiz answers and explanations are withheld until submission.
- CORS is restricted to the configured frontend origin in production.
- Anonymous feedback is rate-limited by IP; authenticated feedback is rate-limited by user ID.
- MongoDB Atlas should allow only the production NAT IP and trusted administrative IPs.

## Project status

Tlearn is an actively developed MVP. The production deployment is suitable for controlled testing, but operational monitoring, automated CI/CD, backups, and a custom domain should be completed before a broad public launch.

