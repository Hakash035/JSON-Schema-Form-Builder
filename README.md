# JSON Schema Form Builder

A minimal, developer-friendly full-stack web application that allows you to dynamically render and validate forms using JSON Schema.

This project is structured as:

 - Frontend: Built with **React**, **TypeScript**, and **TailwindCSS** for a clean, responsive, and developer-friendly UI.
 - Backend: Powered by **FastAPI (Python)** with custom, schema-aware validation logic and PostgreSQL for data persistence.

---

## 🔧 Features

- 🧩 Dynamic form rendering from any valid JSON Schema
- ✅ Live client-side validation with inline error messaging
- 🔁 Support for all basic schema types:
  - `string`, `number`, `boolean`, `object`, `array`, `array of objects`
- 🔐 Schema-defined `required`, `enum`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`
- 🧠 Conditional rendering using `if/then/else`
- 🗃️ Server-side validation (FastAPI) using shared schema logic
- 💾 Data persistence using PostgreSQL
- 💡 "Generate with AI" feature — auto-generates schema from user prompt
- 📥 JSON import/export functionality
- 📚 Prebuilt schema suggestions for quick testing
- 🧼 Clean, responsive UI with light-blue themed design
- 🌐 Swagger UI for backend testing and API reference

---

## 🚀 Live Demo

- **Frontend**: [https://json-schema-form-builder-nu.vercel.app/](https://json-schema-form-builder-nu.vercel.app/)
- **Backend Docs (Swagger)**: [json-schema-form-builder-backend.onrender.com/docs](https://json-schema-form-builder-backend.onrender.com/docs)

---

## API Endpoints Documentation (Swagger Summary)

All backend routes are available via the Swagger UI at:
 **[Backend Swagger Docs](https://json-schema-form-builder-backend.onrender.com/docs)**

Below is a summary of each API endpoint included in the FastAPI backend:

---

### `POST /submit-form`

- **Summary**: Submit Form  
- **Description**: Validate and submit form data based on a JSON Schema.  
  If no `schema_id` is provided, a new schema will be created and associated with the submission.

---

### `GET /list-schemas`

- **Summary**: List Schemas  
- **Description**: Fetch a paginated list of previously submitted schemas.

---

### `GET /schemas-count`

- **Summary**: Get Schema Count  
- **Description**: Returns the total number of schemas stored in the system.

---

### `GET /submissions-count`

- **Summary**: Get Submission Count  
- **Description**: Returns the number of form submissions associated with a specific `schema_id`.

---

### `GET /submissions/{schema_id}`

- **Summary**: List Submissions  
- **Description**: Fetch all submissions linked to a particular schema.

---

### `GET /submission-details/{submission_id}`

- **Summary**: Get Submission Detail  
- **Description**: Fetch a detailed form submission and its associated schema using the submission ID.

---

### `POST /ai-response`

- **Summary**: Generate Schema with AI  
- **Description**: Generate a valid JSON Schema using AI based on the user’s prompt.  
  Returns structured JSON if successful.

---

## Getting Started Locally

### ⚙️ Prerequisites

- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL database (remote)

---

### 📦 Frontend

```bash
cd frontend
cp .env.example .env  # Create your env file

# Set VITE_API_URL in .env
VITE_API_URL=http://localhost:8000

# Install & run
npm install
npm run dev
```

### 🐍 Backend
```bash
cd backend
cp .env.example .env  # Create your env file

# Required .env variables
DATABASE_URL=postgresql+asyncpg://{user}:{password}@{hostname}.{region}-postgres.render.com:{port}/{db_name}
API_KEY=your_gemini_api_key

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
```

### 📁 Project Structure
```bash
/frontend         → React client app (Vite + TailwindCSS)
/backend          → FastAPI app with validation logic & database
```

## ☁️ Deployment Details

### Frontend – Vercel

- Platform: Vercel
- Framework: Vite (React + TypeScript)
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variables:
  - `VITE_API_URL=https://json-schema-form-builder-backend.onrender.com`

---

### Backend – Render (FastAPI)

- Platform: Render
- Service Type: Web Service
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Environment Variables:
  - `DATABASE_URL=postgresql+asyncpg://{user}:{password}@{hostname}.{region}-postgres.render.com:{port}/{db_name}`
  - `API_KEY=your_gemini_api_key`
- Note: Backend may take up to 50 seconds to respond on the first request due to cold start (free-tier limitation).

---

### 🟨 Database – Render PostgreSQL

- Platform: Render PostgreSQL
- Purpose: Used for persisting validated form submissions
- Provisioning: Set up via the Render dashboard (free-tier)
- Connection String Format:
  - `postgresql+asyncpg://{user}:{password}@{hostname}.{region}-postgres.render.com:{port}/{db_name}`


### 📌 Notes
 - `.env` is required in both `frontend/` and `backend/` folders.

 - Backend is hosted on Render free-tier, so it may take ~50 seconds to cold-start on first request.

 - Uses free-tier Gemini API key for schema generation.

 - PostgreSQL database is deployed via Render for development purposes.
