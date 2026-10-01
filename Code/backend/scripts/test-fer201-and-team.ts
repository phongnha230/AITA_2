import prisma from '../src/infrastructure/database/prisma.client.js';
import { CreateTeamUseCase } from '../src/modules/team/application/use-cases/create-team.use-case.js';
import { ManageTeamUseCase } from '../src/modules/team/application/use-cases/manage-team.use-case.js';
import { PrismaTeamRepository } from '../src/modules/team/infrastructure/repositories/prisma-team.repository.js';
import { SandboxRunnerFactory } from '../src/modules/sandbox/infrastructure/sandbox-runner.factory.js';

async function main() {
  console.log('--- Testing FER201 (React JS), Teams, and Git Contributors ---');

  // 1. Get or Create Lecturer & Student
  let lecturer = await prisma.user.findFirst({ where: { role: 'LECTURER' } });
  if (!lecturer) {
    lecturer = await prisma.user.create({
      data: {
        email: 'lecturer.fer201@fpt.edu.vn',
        fullName: 'Lecturer FER201',
        role: 'LECTURER',
        status: 'ACTIVE',
      },
    });
  }

  let student1 = await prisma.user.findFirst({ where: { email: 'student1.fer201@fpt.edu.vn' } });
  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: 'student1.fer201@fpt.edu.vn',
        fullName: 'Nguyen Van A (Leader)',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
  }

  let student2 = await prisma.user.findFirst({ where: { email: 'student2.fer201@fpt.edu.vn' } });
  if (!student2) {
    student2 = await prisma.user.create({
      data: {
        email: 'student2.fer201@fpt.edu.vn',
        fullName: 'Tran Thi B (Member)',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
  }

  // 2. Create Course FER201
  const courseCode = `FER201_${Date.now() % 10000}`;
  const course = await prisma.course.create({
    data: {
      code: courseCode,
      name: 'Front-End Web Development with React',
      semester: 'FA26',
      lecturerId: lecturer.id,
      isActive: true,
    },
  });
  console.log(`✅ Created Course FER201: ${course.name} (${course.code})`);

  // Enroll students
  await prisma.courseEnrollment.createMany({
    data: [
      { courseId: course.id, studentId: student1.id, groupLabel: 'SE1801' },
      { courseId: course.id, studentId: student2.id, groupLabel: 'SE1801' },
    ],
  });

  // 3. Create Assignment for FER201 (React JS, Group Project)
  const assignment = await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: 'FER201 Final Project: E-Commerce Store with React & Tailwind',
      description: 'Build a full-featured e-commerce frontend using React, Context API, and deploy to Vercel.',
      environment: 'REACT_JS',
      submissionType: 'GROUP',
      startTime: new Date(),
      deadline: new Date(Date.now() + 86400000 * 14),
      createdBy: lecturer.id,
      status: 'PUBLISHED',
    },
  });
  console.log(`✅ Created Assignment FER201: ${assignment.title} (Env: ${assignment.environment})`);

  // 4. Test Team Creation & Member Management
  const teamRepo = new PrismaTeamRepository(prisma);
  const createTeamUseCase = new CreateTeamUseCase(teamRepo);
  const manageTeamUseCase = new ManageTeamUseCase(teamRepo, prisma);

  const team = await createTeamUseCase.execute({
    courseId: course.id,
    name: 'Team Alpha - React Wizards',
    projectTitle: 'E-Commerce React Platform',
    gitRepoUrl: 'https://github.com/aita-team-alpha/react-store',
    deployedUrl: 'https://react-store-alpha.vercel.app',
    leaderId: student1.id,
  });
  console.log(`✅ Created Team: ${team.name} by Leader ID: ${team.leaderId}`);

  // Add Member 2
  const updatedTeam = await manageTeamUseCase.addMemberByEmail(
    team.id,
    student2.email,
    student1.id,
    'MEMBER'
  );
  console.log(`✅ Added ${student2.fullName} to Team. Member count: ${updatedTeam.members?.length}`);

  // 5. Test Sandbox Runner Factory for FER201 / REACT
  const runner = SandboxRunnerFactory.createRunner('FER201');
  console.log('✅ Resolved Sandbox Runner for FER201:', runner.constructor.name);

  // 6. Test Web Sandbox E2E Evaluation
  const testSummary = await runner.execute('./workspaces/fer201-demo', [
    {
      id: 'tc-fer201-01',
      questionNo: 'Q1',
      inputData: JSON.stringify([
        { action: 'GOTO', target: '/' },
        { action: 'ASSERT_VISIBLE', target: '#header-nav' },
        { action: 'ASSERT_TEXT', target: 'h1.store-title', expected: 'E-Commerce Store' },
      ]),
      expectedOutput: 'All steps completed successfully',
      timeLimitMs: 5000,
      memoryLimitMb: 256,
      score: 5.0,
    },
    {
      id: 'tc-fer201-02',
      questionNo: 'Q2',
      inputData: JSON.stringify([
        { action: 'GOTO', target: '/cart' },
        { action: 'ASSERT_VISIBLE', target: '.cart-items-table' },
      ]),
      expectedOutput: 'All steps completed successfully',
      timeLimitMs: 5000,
      memoryLimitMb: 256,
      score: 5.0,
    },
  ]);

  console.log(`✅ FER201 Web Test Run Score: ${testSummary.totalScore}/${testSummary.maxScore} (Passed: ${testSummary.passedTests}/${testSummary.totalTests})`);

  // Cleanup test data
  await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
  await prisma.team.delete({ where: { id: team.id } });
  await prisma.assignment.delete({ where: { id: assignment.id } });
  await prisma.courseEnrollment.deleteMany({ where: { courseId: course.id } });
  await prisma.course.delete({ where: { id: course.id } });

  console.log('\n=== All FER201 Course, Team & Web Runner Tests Passed! ===');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
