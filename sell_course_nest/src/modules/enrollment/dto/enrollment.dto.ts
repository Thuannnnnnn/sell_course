export class CreateEnrollmentDto {
  enrollmentId: number;
  userId: string;
  courseId: string;
  status: string;
}

export class CheckEnrollmentDto {
  userId: string;
  courseId: string;
}

export class UpdateEnrollmentStatusDto {
  status: string;
}
