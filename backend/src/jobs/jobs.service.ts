import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';

// Service handling job queue state machine logic and database operations
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  // Create a new job with default status 'pending'
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      title: createJobDto.title,
      type: createJobDto.type,
      status: 'pending',
    });
    return await this.jobsRepository.save(job);
  }

  // Fetch all jobs, optionally filtered by status, ordered latest first
  async findAll(status?: JobStatus): Promise<Job[]> {
    if (status) {
      return await this.jobsRepository.find({
        where: { status },
        order: { createdAt: 'DESC' },
      });
    }

    return await this.jobsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Find a single job by id or throw 404 if not found
  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job #${id} not found`);
    }
    return job;
  }

  // Update status with transition validation and race condition handling
  async updateStatus(id: number, newStatus: JobStatus): Promise<Job> {
    const job = await this.findOne(id);
    const currentStatus = job.status;

    // Validate if the requested transition is allowed
    this.validateStatusTransition(currentStatus, newStatus);

    // Atomically update only if status in DB still matches currentStatus (handles race conditions)
    const updateResult = await this.jobsRepository.update(
      { id, status: currentStatus },
      { status: newStatus },
    );

    // If no row was updated, another request modified the status simultaneously
    if (updateResult.affected === 0) {
      throw new ConflictException(
        `Job #${id} status was modified by another request. Please refresh.`,
      );
    }

    return await this.findOne(id);
  }

  // Validate state machine rules: pending->running, running->completed/failed, terminal states locked
  private validateStatusTransition(
    currentStatus: JobStatus,
    newStatus: JobStatus,
  ): void {
    // Prevent transition to the same status
    if (currentStatus === newStatus) {
      throw new BadRequestException(`Job is already in '${currentStatus}' status`);
    }

    // Pending jobs can only transition to running
    if (currentStatus === 'pending') {
      if (newStatus !== 'running') {
        throw new BadRequestException(
          `Invalid transition: pending job can only transition to 'running'`,
        );
      }
      return;
    }

    // Running jobs can only transition to completed or failed
    if (currentStatus === 'running') {
      if (newStatus !== 'completed' && newStatus !== 'failed') {
        throw new BadRequestException(
          `Invalid transition: running job can only transition to 'completed' or 'failed'`,
        );
      }
      return;
    }

    // Completed and failed are terminal states and cannot be changed
    if (currentStatus === 'completed' || currentStatus === 'failed') {
      throw new BadRequestException(
        `Invalid transition: Job is in terminal state '${currentStatus}' and cannot be changed`,
      );
    }
  }

  // Delete a job from the database
  async delete(id: number): Promise<{ message: string; id: number }> {
    const job = await this.findOne(id);
    await this.jobsRepository.remove(job);
    return { message: `Job #${id} deleted successfully`, id };
  }
}
