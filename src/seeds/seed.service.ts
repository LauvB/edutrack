import { Injectable, Logger } from '@nestjs/common';
import { AdminSeeder } from './seed-data/admin.seeder';
import { ProfessorsSeeder } from './seed-data/professors.seeder';
import { StudentsSeeder } from './seed-data/students.seeder';
import { CoursesSeeder } from './seed-data/courses.seeder';
import { EnrollmentsSeeder } from './seed-data/enrollments.seeder';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    private readonly adminSeeder: AdminSeeder,
    private readonly professorsSeeder: ProfessorsSeeder,
    private readonly studentsSeeder: StudentsSeeder,
    private readonly coursesSeeder: CoursesSeeder,
    private readonly enrollmentsSeeder: EnrollmentsSeeder,
  ) {}

  async runSeed() {
    this.logger.log('Ejecutando Seeders...');

    await this.adminSeeder.run();
    await this.professorsSeeder.run();
    await this.studentsSeeder.run();
    await this.coursesSeeder.run();
    await this.enrollmentsSeeder.run();

    this.logger.log('✔ Seeders completados.');
  }
}
