export class CoursePurchasedDTO {
  email: string;
  coursePurchaseId: string;
  courseId: string;
  title: string;
  categoryName: string;
  categoryId: string;
  imageInfo: string;

  constructor(
    email: string,
    coursePurchaseId: string,
    courseId: string,
    title: string,
    categoryName: string = 'Unknown Category',
    categoryId: string = 'Unknown',
    imageInfo: string = '',
  ) {
    this.email = email;
    this.coursePurchaseId = coursePurchaseId;
    this.courseId = courseId;
    this.title = title;
    this.categoryName = categoryName;
    this.categoryId = categoryId;
    this.imageInfo = imageInfo;
  }
}
