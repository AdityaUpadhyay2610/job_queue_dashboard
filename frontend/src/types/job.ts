// Allowed job status values in the state machine
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Job entity model matching the backend SQLite database record
export interface Job {
  id: number;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: string;
}

// Payload interface for creating a new job
export interface CreateJobInput {
  title: string;
  type: string;
}
