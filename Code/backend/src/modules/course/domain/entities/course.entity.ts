export interface CourseProps {
  id: string;
  code: string;
  name: string;
  semester: string;
  lecturerId: string;
  isActive: boolean;
  enrollmentCode?: string | null;
  codeExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lecturer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class Course {
  constructor(private readonly props: CourseProps) {}

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get semester(): string {
    return this.props.semester;
  }

  get lecturerId(): string {
    return this.props.lecturerId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get enrollmentCode(): string | null | undefined {
    return this.props.enrollmentCode;
  }

  get codeExpiresAt(): Date | null | undefined {
    return this.props.codeExpiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lecturer() {
    return this.props.lecturer;
  }

  public isCodeActive(): boolean {
    if (!this.props.enrollmentCode || !this.props.codeExpiresAt) {
      return false;
    }
    return new Date() <= this.props.codeExpiresAt;
  }

  public isCodeExpired(): boolean {
    return !this.isCodeActive();
  }

  toJSON() {
    return {
      id: this.props.id,
      code: this.props.code,
      name: this.props.name,
      semester: this.props.semester,
      lecturerId: this.props.lecturerId,
      isActive: this.props.isActive,
      enrollmentCode: this.props.enrollmentCode,
      codeExpiresAt: this.props.codeExpiresAt,
      isCodeActive: this.isCodeActive(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      lecturer: this.props.lecturer,
    };
  }
}
