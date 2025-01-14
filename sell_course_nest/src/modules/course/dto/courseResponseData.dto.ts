export class CourseResponseDTO {
  constructor(
    public courseId: string,
    public title: string,
    public price: number,
    public description: string,
    public videoInfo: string,
    public imageInfo: string,
    public createdAt: Date,
    public updatedAt: Date,
    public userId: string,
    public categoryId: string,
  ) {}
}
