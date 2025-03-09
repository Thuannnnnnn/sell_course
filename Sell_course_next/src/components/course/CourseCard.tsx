import { CoursePurchaseAPI } from "@/app/api/coursePurchased/coursePurchased";
import {
  createWishListCourse,
  fetchWishListCourse,
} from "@/app/api/wishListCourse/wishListCourse";
import "@/style/CourseCard.css";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import axios from "axios";

interface Course {
  courseId: string;
  userAvata?: string;
  userName: string;
  imageInfo: string;
  categoryName: string;
  title: string;
  price: number;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const localActive = useLocale();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user?.user_id) return;

      try {
        const wishlist = await fetchWishListCourse(session.user.user_id);
        if (Array.isArray(wishlist)) {
          const isCourseWishlisted = wishlist.some(
            (item) => item.courseId === course.courseId
          );
          setIsWishlisted(isCourseWishlisted);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [session, course.courseId]);

  const deleteWishListCourse = async (userId: string, courseId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist/${courseId}`
      );
      console.log("Removed from wishlist:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Error deleting wish list course:",
          error.response.status,
          error.response.data
        );
      } else {
        console.error("Unknown error:", error);
      }
      throw error;
    }
  };

  const handleWishlistToggle = async () => {
    if (!session?.user?.user_id) {
      alert("Bạn cần đăng nhập để thêm vào wishlist!");
      return;
    }

    try {
      if (isWishlisted) {
        await deleteWishListCourse(session.user.user_id, course.courseId);
        console.log("Removed from wishlist");
      } else {
        await createWishListCourse(session.user.user_id, course.courseId);
        console.log("Added to wishlist");
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleCoursePurchase = async (courseId: string) => {
    if (!session?.user.email) return;

    try {
      const data = await CoursePurchaseAPI.getCoursePurchaseById(
        courseId,
        session?.user.email
      );
      if (data === 200) {
        router.push(`/${localActive}/courseInfo/${courseId}`);
        return;
      }
      router.push(`/${localActive}/courseDetail/${courseId}`);
    } catch (error) {
      console.error("Error fetching course purchase:", error);
    }
  };

  return (
    <div className="card">
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
      <div
        className="image-wrapper"
        onClick={() => handleCoursePurchase(course.courseId)}
      >
        <Image
          src={course.imageInfo}
          alt="Course Thumbnail"
          width={250}
          height={140}
          className="image"
        />
      </div>

      <div className="content-courseCard">
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
        <div className="price-like">
          <div className="like" onClick={handleWishlistToggle}>
            {isWishlisted ? (
              <FaHeart className="wishlist-active" />
            ) : (
              <FaRegHeart />
            )}
          </div>
          <p className="price">${course.price}</p>
        </div>
      </div>
    </div>
  );
}
