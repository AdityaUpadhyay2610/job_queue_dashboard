import { IsNotEmpty, IsString } from 'class-validator';

// Data Transfer Object for creating a new job
export class CreateJobDto {
  // Title must be a non-empty string
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  // Job type must be a non-empty string
  @IsString()
  @IsNotEmpty({ message: 'Job type is required' })
  type: string;
}
