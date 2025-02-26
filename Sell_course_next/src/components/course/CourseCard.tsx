import { CoursePurchaseAPI } from "@/app/api/coursePurchased/coursePurchased";
import { Course } from "@/app/type/course/Course";
import "@/style/CourseCard.css";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const localActive = useLocale();
  const handleCoursePurchase = async (courseId: string) => {
    if (!session?.user.email) return;

    try {
      const data = await CoursePurchaseAPI.getCoursePurchaseById(
        courseId,
        session?.user.email
      );
      if (data === 200) {
        console.log("ABC");
        router.push(`/${localActive}/courseInfo/${courseId}`);
        return;
      }
      router.push(`/${localActive}/courseDetail/${courseId}`);
    } catch (error) {
      console.error("Error fetching course purchase:", error);
    }
  };

  return (
    <div className="card" onClick={() => handleCoursePurchase(course.courseId)}>
      <div className="header">
        <Image
          src={course.userAvata || ""}
          alt="Avatar"
          width={30}
          height={30}
          className="avatarImage"
        />
        <span className="name">{course.userName}</span>
      </div>

      <div className="image-wrapper">
        <Image
          src={course.imageInfo}
          alt="Course Thumbnail"
          width={250}
          height={140}
          className="image"
        />
      </div>

      <div className="content">
        <div className="tt">
          <span className="category">{course.categoryName}</span>

          <p className="lessons">12 Lessons</p>

          <h3 className="title">{course.title}</h3>
        </div>
      </div>
      <div className="footer">
        <div className="rating">
          {[...Array(5)].map((_, index) =>
            index < 4 ? (
              <AiFillStar key={index} className="star" />
            ) : (
              <AiOutlineStar key={index} className="star" />
            )
          )}
        </div>

        <p className="price">${course.price}</p>
      </div>
    </div>
  );
}
