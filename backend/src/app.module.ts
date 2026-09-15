import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/job.entity';

// Root application module configuring SQLite database and loading JobsModule
@Module({
  imports: [
    // Configure SQLite database with automatic table creation
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'jobs.db',
      entities: [Job],
      synchronize: true,
    }),
    JobsModule,
  ],
})
export class AppModule {}
