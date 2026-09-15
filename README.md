# 📦 Job Queue Dashboard

A production-grade, full-stack **Job Queue Dashboard** built with **NestJS + SQLite (TypeORM)** on the backend and **React (TypeScript + Tailwind CSS + Vite)** on the frontend.

---

## 🌐 4. Submission & Deployment Details

- **GitHub Repository Link:** [https://github.com/AdityaUpadhyay2610/job_queue_dashboard](https://github.com/AdityaUpadhyay2610/job_queue_dashboard) *(Public)*
- **Live Backend / API URL:** [https://job-queue-dashboard-e5q0.onrender.com](https://job-queue-dashboard-e5q0.onrender.com)  
  *(Test endpoint: [https://job-queue-dashboard-e5q0.onrender.com/jobs](https://job-queue-dashboard-e5q0.onrender.com/jobs))*
- **Live Frontend URL:** [https://job-queue-dashboard-phi.vercel.app](https://job-queue-dashboard-phi.vercel.app) *(or your deployed Vercel URL)*

---

### 🧠 Assumptions, Trade-offs & Future Improvements

#### 1. Assumptions Made:
- **Strict State Machine Workflow**: State transitions flow deterministically: `pending` ➔ `running` ➔ `completed` OR `failed`.
- **Immutable Terminal States**: Once a job reaches `completed` or `failed`, it cannot be transitioned further or re-run (terminal states).
- **Single-Node Execution**: For demonstration and evaluation purposes, an embedded SQLite database provides zero-configuration local and cloud persistence.

#### 2. Trade-offs Made:
- **SQLite vs. Managed PostgreSQL**: SQLite was chosen to make the repository lightweight, self-contained, and runnable out-of-the-box with zero database provisioning steps. On free-tier cloud servers (like Render), disk storage is ephemeral across server sleeps; in an enterprise environment, this would be backed by a managed PostgreSQL cluster (e.g. Neon or AWS RDS).
- **Optimistic Concurrency vs. Distributed Locks**: We implemented atomic conditional SQL updates (`WHERE id = :id AND status = :currentStatus`) combined with HTTP 409 conflict handling. This avoids the latency and complexity of distributed Redis locking while providing complete race-condition safety.
- **Polling / Re-fetch vs. WebSockets**: When mutations or conflicts occur, the React frontend immediately re-synchronizes the dataset. This keeps server resource footprint low without persistent WebSocket connection overhead.

#### 3. Improvements with More Time:
- **Asynchronous Worker Queue**: Integrate Redis with [BullMQ](https://bullmq.io/) to execute background processor worker pools for long-running tasks with automatic retries and exponential backoff.
- **Real-Time Streaming**: Add WebSockets (via `@nestjs/websockets` / Socket.io) or Server-Sent Events (SSE) for live multi-user collaboration and instant status propagation across connected dashboards.
- **Automated Test Suite**: Add comprehensive E2E integration tests with Playwright/Cypress and backend unit tests with Jest and Supertest.
- **Pagination & Search**: Implement cursor-based pagination and full-text keyword search for large-scale datasets with tens of thousands of jobs.
- **Audit History Log**: Track transition timestamp logs and user metadata for every state change.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

---

### 1. Backend Setup (NestJS + SQLite)

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
npm run start:dev
```

* The backend will start on **`http://localhost:3000`**
* SQLite database file (`jobs.db`) is automatically created in the `backend` directory with tables synchronized.

---

### 2. Frontend Setup (React + TypeScript + Tailwind CSS)

Open a second terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

* The frontend application will start on **`http://localhost:5173`**

---

## ✨ Features

- **Real-Time Job Management**: Create, list, filter, transition, and delete background jobs.
- **Strict State Machine**: Validates transitions (`pending` ➔ `running` ➔ `completed` / `failed`) on the backend to guarantee database integrity.
- **Race Condition Prevention**: Employs atomic conditional queries (`WHERE id = :id AND status = :currentStatus`) preventing conflicting concurrent state mutations.
- **Summary Metrics & KPI Cards**: Real-time totals for Total, Pending, Running, Completed, and Failed jobs.
- **Dynamic Status Filtering**: Filter jobs seamlessly by status (`all`, `pending`, `running`, `completed`, `failed`).
- **Interactive UI Feedback**: Instant toasts for successful updates, conflicts, and network errors.
- **Modern Responsive Design**: Built with Tailwind CSS, Lucide icons, glassmorphism accents, and accessible table layouts.

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
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
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
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.js
│
└── README.md
```

---

## 🎯 Architecture & Core Questions FAQ

### 1. Where should this rule be enforced?
**Answer:** State transition rules must be enforced **strictly on the Backend Service layer** (`backend/src/jobs/jobs.service.ts` in `validateStatusTransition()`).

* **Why on the Backend?**  
  The backend is the authoritative **Single Source of Truth**. Enforcing state validations at the server level guarantees data consistency, security, and integrity across all clients.
* **Role of the Frontend:**  
  The React UI conditionally disables/hides invalid action buttons for optimal **User Experience (UX)**, but never as the primary security or business validation layer.

---

### 2. What happens if someone bypasses the React application and calls the API directly?
**Answer:** The request is **immediately intercepted and rejected** by the backend with an **HTTP 400 Bad Request** error.

* If a user or script bypasses the UI and sends a `PATCH /jobs/:id/status` directly with an invalid transition (e.g., trying to jump directly from `pending` ➔ `completed`):
  1. The request reaches `JobsService.validateStatusTransition()`.
  2. The service detects the violation and throws `BadRequestException("Invalid transition: pending job can only transition to 'running'")`.
  3. **Zero database writes occur**, preserving data integrity.

---

### 3. What happens when two requests arrive at nearly the same time?
**Answer:** The **first request to execute succeeds**, and the **second request safely fails with an HTTP 409 Conflict** error without corrupting data.

* When two concurrent requests try to transition the exact same running job (e.g., Request A clicks *Complete* and Request B clicks *Fail* at the exact same millisecond):
  1. Both pass initial validation checks.
  2. The backend performs an **atomic conditional update**:
     ```typescript
     const updateResult = await this.jobsRepository.update(
       { id: job.id, status: currentStatus }, // WHERE id = :id AND status = :currentStatus
       { status: newStatus }
     );
     ```
  3. Request A updates the database (`running` ➔ `completed`).
  4. When Request B's query executes, the row is no longer in `running` status, resulting in `updateResult.affected === 0`.
  5. The backend detects this and throws a `ConflictException` (HTTP 409):
     > *"Race condition detected: Job status was modified by another request. Please refresh."*
  6. The frontend shows an informative warning toast and re-synchronizes the latest table state.

---

### 4. How would you prevent an invalid or inconsistent state?
**Answer:** By applying a comprehensive **multi-layered validation and concurrency strategy**:

| Layer | Technique | Implementation in this Project |
| :--- | :--- | :--- |
| **1. Request DTO Layer** | Strict Payload Validation | `class-validator` and global `ValidationPipe({ whitelist: true })` prevent unauthorized or malformed status values. |
| **2. Business Logic Layer** | State Machine Transition Validation | `validateStatusTransition()` verifies that state moves strictly along `pending` ➔ `running` ➔ `completed` / `failed`, locking terminal states. |
| **3. Concurrency Layer** | Atomic Conditional Updates (Optimistic Locking) | `UPDATE jobs SET status = :new WHERE id = :id AND status = :old` prevents race-condition overwrites. |
| **4. Database Layer** | TypeORM Schema Constraints | Non-nullable status enum types and indexed columns in SQLite prevent corrupted states. |

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job | `{"title": "Job Title", "description": "Optional"}` |
| `GET` | `/jobs` | Get all jobs (newest first) | None |
| `GET` | `/jobs?status=:status` | Filter jobs by status | Query param `?status=pending` (or running, completed, failed) |
| `GET` | `/jobs/:id` | Get details for a single job | None |
| `PATCH` | `/jobs/:id/status` | Transition job status | `{"status": "running"}` |
| `DELETE` | `/jobs/:id` | Delete a job | None |

---

## 🛠 Tech Stack

- **Backend:** [NestJS](https://nestjs.com/) (Node.js framework), [TypeORM](https://typeorm.io/), [SQLite3](https://www.sqlite.org/), `class-validator`
- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Vite](https://vitejs.dev/), [Lucide React](https://lucide.dev/)
- **Deployment:** Render (Backend Web Service) + Vercel (Frontend Static Hosting)