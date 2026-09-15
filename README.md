# 📦 Job Queue Dashboard

A production-grade, full-stack **Job Queue Dashboard** built with **NestJS + SQLite (TypeORM)** on the backend and **React (TypeScript + Tailwind CSS + Vite)** on the frontend.

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