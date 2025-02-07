export class CoursePurchasedDTO {
  user_id: string;
  email: string;
  coursePurchaseId: string;
  courseId: string;
  title: string;
  categoryName: string;
  categoryId: string;
  imageInfo: string;

  constructor(
    user_id: string,
    email: string,
    coursePurchaseId: string,
    courseId: string,
    title: string,
    categoryName: string = 'Unknown Category',
    categoryId: string = 'Unknown',
    imageInfo: string = '',
  ) {
    this.user_id = user_id;
    this.email = email;
    this.coursePurchaseId = coursePurchaseId;
    this.courseId = courseId;
    this.title = title;
    this.categoryName = categoryName;
    this.categoryId = categoryId;
    this.imageInfo = imageInfo;
  }
}