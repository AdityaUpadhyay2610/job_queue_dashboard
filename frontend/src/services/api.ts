import { Job, JobStatus, CreateJobInput } from '../types/job';

// Base backend URL supporting environment variable VITE_API_BASE_URL or defaulting to local 127.0.0.1:3000
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

// API service client for communicating with NestJS backend
export const api = {
  // Fetch all jobs, optionally filtered by status query param
  async getJobs(status?: string): Promise<Job[]> {
    const url =
      status && status !== 'all'
        ? `${API_BASE_URL}/jobs?status=${encodeURIComponent(status)}`
        : `${API_BASE_URL}/jobs`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs (HTTP ${response.status})`);
    }
    return response.json();
  },

  // Create a new job with default status 'pending'
  async createJob(input: CreateJobInput): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || `Failed to create job (HTTP ${response.status})`;
      throw new Error(msg);
    }
    return response.json();
  },

  // Update job status with state machine transition checks and race condition handling
  async updateJobStatus(id: number, status: JobStatus): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || `Failed to update status (HTTP ${response.status})`;
      throw new Error(msg);
    }
    return response.json();
  },

  // Delete a job by id
  async deleteJob(id: number): Promise<{ message: string; id: number }> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete job (HTTP ${response.status})`,
      );
    }
    return response.json();
  },
};
