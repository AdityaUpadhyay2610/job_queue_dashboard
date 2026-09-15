# 📦 Job Queue Dashboard

A full-stack Job Queue Dashboard built with **NestJS (SQLite + TypeORM)** on the backend and **React (TypeScript + Tailwind CSS + Vite)** on the frontend.

---

## 🌐 Live Demo & Repository

- **GitHub Repository:** [https://github.com/AdityaUpadhyay2610/job_queue_dashboard](https://github.com/AdityaUpadhyay2610/job_queue_dashboard)
- **Live Frontend:** [https://job-queue-dashboard-phi.vercel.app](https://job-queue-dashboard-phi.vercel.app)
- **Live Backend API:** [https://job-queue-dashboard-e5q0.onrender.com](https://job-queue-dashboard-e5q0.onrender.com)
  *(Test endpoint: [https://job-queue-dashboard-e5q0.onrender.com/jobs](https://job-queue-dashboard-e5q0.onrender.com/jobs))*

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Start the Backend

```bash
cd backend
npm install
npm run start:dev
```
- Backend runs at `http://localhost:3000`
- SQLite database (`jobs.db`) is created automatically in the `backend` folder.

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```
- Frontend runs at `http://localhost:5173`

---

## ✨ Features

- **Job Management**: Create new jobs, view list, transition status, and delete jobs.
- **State Machine Rules**: Follows strict lifecycle (`pending` ➔ `running` ➔ `completed` or `failed`).
- **Conflict Handling**: Prevents race conditions when two actions happen simultaneously.
- **Summary Metrics**: Overview count of total, pending, running, completed, and failed jobs.
- **Filtering**: Filter jobs by status (`all`, `pending`, `running`, `completed`, `failed`).
- **Feedback Toasts**: Clear alerts for successful actions, validation errors, and conflicts.

---

## 📂 Project Structure

```
job-queue-dashboard/
├── backend/
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/
│   │   │   │   ├── create-job.dto.ts
│   │   │   │   └── update-status.dto.ts
│   │   │   ├── job.entity.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.module.ts
│   │   │   └── jobs.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateJobModal.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── JobTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SummaryMetrics.tsx
│   │   │   └── Toast.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── job.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## 🧠 Assumptions & Trade-offs

### Assumptions
1. **Job Lifecycle**: Jobs start as `pending`, move to `running`, and finish as either `completed` or `failed`.
2. **Terminal States**: Once a job is `completed` or `failed`, it cannot be modified further.
3. **Single App Deployment**: Built for single-server or demo evaluation using an embedded SQLite database.

### Trade-offs
1. **SQLite instead of PostgreSQL**: SQLite was chosen to make the project easy to download, run, and test immediately without having to set up a local database server or Docker container. For a production environment with multiple server instances, PostgreSQL would be the preferred choice.
2. **Re-fetching on Action instead of WebSockets**: After a job status is updated or a conflict occurs, the frontend re-fetches the latest job list. This keeps the implementation straightforward and reliable without the extra complexity of maintaining WebSocket connections.

### What I Would Add with More Time
- **Background Worker Processing**: Integrate a queue processor like BullMQ with Redis to simulate real asynchronous job execution.
- **Automated Tests**: Add unit tests for the backend service (`jobs.service.spec.ts`) and component tests for the React UI.
- **Pagination & Search**: Add page numbers and a search bar for when the queue has hundreds of jobs.
- **Authentication**: Add basic login/role management so only authorized users can trigger job actions.

---

## 🎯 Architecture Questions

### 1. Where should this rule be enforced?
**Answer:** State transition rules must always be enforced on the **backend** (in `JobsService.validateStatusTransition()`).

- **Why backend?** The backend is the single source of truth. Users or external scripts can bypass the frontend and make direct HTTP requests. Validating on the backend guarantees that bad data never reaches the database.
- **Frontend role:** The frontend disables invalid buttons (e.g. disabling "Complete" when a job is still `pending`) to provide good UX and prevent obvious user mistakes, but the backend is the true safety check.

---

### 2. What happens if someone bypasses the React application and calls the API directly?
**Answer:** The request is rejected with an **HTTP 400 Bad Request** error.

- If an API request tries an invalid transition (like jumping from `pending` directly to `completed`), the backend service catches it before running any update query:
  ```typescript
  if (currentStatus === 'pending' && newStatus !== 'running') {
    throw new BadRequestException("Invalid transition: pending job can only transition to 'running'");
  }
  ```
- No database changes happen, and the client receives a clear error message.

---

### 3. What happens when two requests arrive at nearly the same time? (Race Conditions)
**Answer:** The first request succeeds, and the second request returns an **HTTP 409 Conflict** error.

- When two requests try to update the same running job at the exact same moment (for example, one clicks *Complete* and another clicks *Fail*):
  1. The backend uses a conditional SQL update:
     ```typescript
     const updateResult = await this.jobsRepository.update(
       { id, status: currentStatus }, // checks if status is still what we read
       { status: newStatus }
     );
     ```
  2. The first request updates the row (`running` ➔ `completed`).
  3. The second request runs its query, but since the status is no longer `running`, it affects `0` rows.
  4. The backend detects `affected === 0` and throws a `ConflictException` (HTTP 409).
  5. The React frontend shows a friendly warning toast and re-fetches the job table so the user sees the latest data.

---

### 4. How would you prevent an invalid or inconsistent state?
**Answer:** By applying validation checks at every layer:

1. **DTO Validation**: Using `class-validator` to ensure required fields (`title`, `type`, `status`) are valid strings and not empty.
2. **Service Validation**: Checking current status vs target status before allowing transitions.
3. **Safe Updates**: Updating conditionally (`WHERE id = :id AND status = :currentStatus`) so concurrent requests don't overwrite each other.
4. **Database Schema**: Using SQLite column definitions to ensure required fields are not nullable.

---

## 🌟 Bonus: Production-Ready Improvement

### Improvement Chosen: **Safe Concurrent Updates & Conflict Recovery**

### Why I chose this:
In a real production environment, multiple team members or automated processes might view and manage the dashboard at the same time. If two people click different actions on the same job simultaneously, a standard update could silently overwrite the earlier action without anyone noticing.

### How it works:
1. **Backend**: Instead of doing `save()`, the service runs a conditional update that verifies the job's current status in the database matches what was loaded when the user viewed it. If it changed in the meantime, it returns a `409 Conflict`.
2. **Frontend**: When the React app receives a 409 status code, it displays an informative toast (`"Job status was modified by another request. Table re-synchronized."`) and automatically re-fetches the job list so the UI stays accurate.

This provides a simple, reliable way to prevent race conditions without needing extra infrastructure like Redis locks.

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job | `{"title": "Job Title", "type": "Email"}` |
| `GET` | `/jobs` | Get all jobs (newest first) | None |
| `GET` | `/jobs?status=:status` | Filter jobs by status | None |
| `GET` | `/jobs/:id` | Get details for a single job | None |
| `PATCH` | `/jobs/:id/status` | Update job status | `{"status": "running"}` |
| `DELETE` | `/jobs/:id` | Delete a job | None |

---

## 🛠 Tech Stack

- **Backend:** NestJS, TypeORM, SQLite, class-validator
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Deployment:** Render (Backend) + Vercel (Frontend)
