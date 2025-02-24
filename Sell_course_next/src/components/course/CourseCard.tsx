import { Course } from "@/app/type/course/Course";
import "@/style/CourseCard.css";
// import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const params = useParams();
  // const { data: session } = useSession();
  // const email = session?.user.email || "";
  const handleClick = async () => {
    const locale = params.locale;

    router.push(`/${locale}/courseDetail/${course.courseId}`);
  };
  return (
    <div className="card" onClick={handleClick}>
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
