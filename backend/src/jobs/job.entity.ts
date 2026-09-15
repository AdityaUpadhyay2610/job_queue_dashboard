import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// Job status types for the state machine
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Job database entity for SQLite table 'jobs'
@Entity('jobs')
export class Job {
  // Auto-increment primary key
  @PrimaryGeneratedColumn()
  id: number;

  // Title of the background task
  @Column()
  title: string;

  // Category or type of the job
  @Column()
  type: string;

  // Current status of the job (defaults to pending)
  @Column({
    type: 'text',
    default: 'pending',
  })
  status: JobStatus;

  // Automatic timestamp when the job is created
  @CreateDateColumn()
  createdAt: Date;
}
