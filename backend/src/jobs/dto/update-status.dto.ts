import { IsIn, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../job.entity';

// Data Transfer Object for updating job status
export class UpdateStatusDto {
  // Status must be one of the four allowed state values
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['pending', 'running', 'completed', 'failed'], {
    message: 'Status must be one of: pending, running, completed, failed',
  })
  status: JobStatus;
}
