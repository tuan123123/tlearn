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

## Phase 3 topic review behavior

After at least one uploaded file has `extraction_status = "done"`, the course setup page shows topic review.

When you click **Extract Topics**:

1. FastAPI loads extracted text from ready uploads.
2. The backend asks OpenAI to map the material to the fixed Microeconomics topic template.
3. AI topics are validated with Pydantic.
4. Invalid topics are skipped.
5. Valid topics are saved in MongoDB under the `topics` collection.
6. The frontend lets you edit, delete, add, approve, and confirm topics.

Set these backend variables in `backend\.env`:

```env
OPENAI_API_KEY=your-real-openai-api-key
OPENAI_TOPIC_MODEL=gpt-5.4-mini
```

The topic names are stored as canonical English template values in MongoDB. The frontend has an English/Vietnamese toggle, so Vietnamese labels are shown in the UI without changing the stored topic identity.

For example:

- `Supply and Demand` → `Cung và cầu`
- `Price Elasticity` → `Độ co giãn theo giá`
- `Consumer Theory` → `Lý thuyết người tiêu dùng`

Vietnamese documents are supported by the topic extraction prompt. The AI is told to recognize Vietnamese aliases such as `ngoại tác`, `hàng hóa công`, `độc quyền`, `cạnh tranh hoàn hảo`, and `thương mại quốc tế`, then map them back to the fixed English topic keys. Evidence quotes stay in the original document language.

## Phase 4 diagnostic quiz behavior

After topics are approved, open `/courses/:id/diagnostic` and click **Generate Diagnostic Quiz**.

The backend will:

1. Generate Bloom-tagged questions from approved topics and extracted materials.
2. Save questions in MongoDB under `questions`.
3. Create a diagnostic quiz under `quizzes`.
4. Return quiz questions without `correct_answer` or `explanation`.
5. Save submitted answers under `attempts`.
6. Reveal correct answers and explanations only from `/quizzes/:id/results`.

Frontend pages:

- `/courses/:id/diagnostic`
- `/quizzes/:id`
- `/quizzes/:id/results`

Important safety rule: `GET /quizzes/:id` intentionally strips answers before submission. Use `/quizzes/:id/results` only after submission to review answers.

## Environment variables

Backend variables live in `backend\.env`:

- `MONGODB_URL`: MongoDB server URL
- `MONGODB_DB_NAME`: database name
- `JWT_SECRET`: secret key used to sign JWTs
- `JWT_EXPIRE_MINUTES`: how long login tokens last
- `FRONTEND_URL`: production frontend URL for CORS
- `ENVIRONMENT`: use `development` locally
- `OPENAI_API_KEY`: OpenAI API key used for topic extraction
- `OPENAI_TOPIC_MODEL`: model used for topic extraction

Frontend variables live in `frontend\.env`:

- `VITE_API_URL`: backend API URL, usually `http://127.0.0.1:8000`

Never commit real secrets. Use `.env.example` only for safe placeholder values.
