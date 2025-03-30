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
import { interactionApi } from "@/app/api/interaction/interactionApi";
import { InteractionType } from "@/app/type/Interaction/Interaction";
import defait from "../.../../../../public/defait-img.png";
import poster from "../.../../../../public/poster_img.jpg";
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
    if (session?.user?.user_id) {
      try {
        await interactionApi.createOrUpdateInteraction({
          user: {
            user_id: session.user.user_id,
          },
          course: {
            courseId: course.courseId,
          },
          interaction_type: InteractionType.WISHLIST,
        });
      } catch (error) {
        console.error("Error creating interaction:", error);
      }
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

  const handleGotoCourseDetail = async (courseId: string) => {
    if (session?.user?.user_id) {
      try {
        await interactionApi.createOrUpdateInteraction({
          user: {
            user_id: session.user.user_id,
          },
          course: {
            courseId: courseId,
          },
          interaction_type: InteractionType.VIEW,
        });
      } catch (error) {
        console.error("Error creating interaction:", error);
      }
    }
    router.push(`/${localActive}/courseDetail/${courseId}`);
  };

  return (
    <div className="cardListCourse">
      <div className="header">
        <Image
          src={course.userAvata || defait}
          alt="Avatar"
          width={30}
          height={30}
          className="avatarImage"
        />
        <span className="name">{course.userName}</span>
      </div>
      <div
        className="image-wrapper"
        onClick={() => handleGotoCourseDetail(course.courseId)}
      >
        <Image
          src={course.imageInfo || poster}
          alt="Course Thumbnail"
          width={250}
          height={140}
          className="image"
        />
      </div>

      <div className="content-courseCard">
        <div className="tt">
          <span className="category">{course.categoryName}</span>
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
