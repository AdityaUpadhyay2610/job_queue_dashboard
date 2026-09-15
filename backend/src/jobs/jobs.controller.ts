import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JobStatus } from './job.entity';

// REST API controller for job queue operations
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // POST /jobs - Create a new job with status 'pending'
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  // GET /jobs - Return all jobs, optionally filtered by ?status=...
  @Get()
  findAll(@Query('status') status?: JobStatus) {
    return this.jobsService.findAll(status);
  }

  // GET /jobs/:id - Return a single job by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  // PATCH /jobs/:id/status - Update status with validation and race condition check
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.jobsService.updateStatus(id, updateStatusDto.status);
  }

  // DELETE /jobs/:id - Delete a job by id
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.delete(id);
  }
}
