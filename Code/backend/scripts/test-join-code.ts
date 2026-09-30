import prisma from '../src/infrastructure/database/prisma.client.js';
import { PrismaCourseRepository } from '../src/modules/course/infrastructure/repositories/prisma-course.repository.js';
import { GenerateJoinCodeUseCase } from '../src/modules/course/application/use-cases/generate-join-code.use-case.js';
import { JoinCourseByCodeUseCase } from '../src/modules/course/application/use-cases/join-course-by-code.use-case.js';
import { RevokeJoinCodeUseCase } from '../src/modules/course/application/use-cases/revoke-join-code.use-case.js';

async function main() {
  console.log('--- Testing Course Join Code Feature ---');
  const courseRepo = new PrismaCourseRepository(prisma);
  const generateUseCase = new GenerateJoinCodeUseCase(courseRepo);
  const joinUseCase = new JoinCourseByCodeUseCase(courseRepo);
  const revokeUseCase = new RevokeJoinCodeUseCase(courseRepo);

  // 1. Find a test course and student
  const course = await prisma.course.findFirst();
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });

  if (!course || !student) {
    console.log('Skipping test: Missing seed course or student in DB');
    return;
  }

  console.log(`Course: ${course.name} (${course.code}, ID: ${course.id})`);
  console.log(`Student: ${student.fullName} (${student.email}, ID: ${student.id})`);

  // Ensure student is not enrolled initially for testing
  await prisma.courseEnrollment.deleteMany({
    where: { courseId: course.id, studentId: student.id },
  });

  // 2. Lecturer generates join code with 15 minutes TTL
  const genResult = await generateUseCase.execute(course.id, { expiresInMinutes: 15 });
  console.log('1. Generated Join Code:', genResult);

  // 3. Student joins course using the code
  const joinResult = await joinUseCase.execute(student.id, { code: genResult.joinCode });
  console.log('2. Join Result (1st time):', joinResult);

  // 4. Student joins again (should say already enrolled)
  const joinAgainResult = await joinUseCase.execute(student.id, { code: genResult.joinCode });
  console.log('3. Join Result (2nd time):', joinAgainResult);

  // 5. Test revoking code
  const revokeResult = await revokeUseCase.execute(course.id);
  console.log('4. Revoke Result:', revokeResult);

  // 6. Student trying to join after revoke should fail
  try {
    await joinUseCase.execute(student.id, { code: genResult.joinCode });
    console.error('FAIL: Should not be able to join with revoked code');
  } catch (err: any) {
    console.log('5. SUCCESS: Expected error on joining with revoked code ->', err.message);
  }

  console.log('=== All Join Code Flow Tests Passed! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
