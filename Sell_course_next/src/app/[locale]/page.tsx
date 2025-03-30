"use client";
import { useLocale, useTranslations } from "next-intl";
import logoJava from "../.../../../../public/logoJava_img.jpg";
import logoJs from "../.../../../../public/logoJS_img.jpg";
import logoCPlusPlus from "../.../../../../public/logoC++_img.png";
import logoCSharp from "../.../../../../public/logoC_img.jpg";
import logoNodeJs from "../.../../../../public/logoSQL_img.jpg";
import logoSQL from "../.../../../../public/logoSQL_img.jpg";
import poster from "../.../../../../public/poster_img.jpg";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Banner from "@/components/Banner";
import { useEffect, useState } from "react";
import { Course } from "../type/course/Course";
import { fetchCourses } from "../api/course/CourseAPI";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import "@/style/HomePage.css";
import { fetchUserAnswersByUserId } from "../api/userAnswer/userAnswerApi";
import { interactionApi } from "../api/interaction/interactionApi";
import { InteractionType } from "../type/Interaction/Interaction";
import { recommend } from "../api/recomend/recomend";
export default function HomePage() {
  const t = useTranslations("homePage");
  const tc = useTranslations("cardCourse");
  const localActive = useLocale();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (session && session.user && session.user.user_id) {
      const checkUserAnswers = async () => {
        try {
          const answers = await fetchUserAnswersByUserId(session.user.user_id);
          if (answers.length === 0) {
            router.push(`/${localActive}/questionHabits`);
          }
        } catch (error) {
          console.error("Error checking user answers:", error);
        }
      };
      checkUserAnswers();
    }
  }, [session, localActive, router]);

  useEffect(() => {
    if (session && session.user && session.user.user_id) {
      const loadCourses = async () => {
        try {
          const coursesData = await fetchCourses();
          const recData = await recommend(session.user.user_id);

          if (!recData || !recData.recommended_courses) {
            console.warn("No recommended courses found");
            return;
          }

          const recommendedIds = recData.recommended_courses;

          const filteredCourses = coursesData.filter((course) =>
            recommendedIds.includes(course.courseId)
          );

          setCourses(filteredCourses);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      };

      loadCourses();
    }
  }, [session]);

  const params = useParams();
  const handleClick = async (courseDetaill: string) => {
    const locale = params.locale;

    if (session?.user?.user_id) {
      try {
        await interactionApi.createOrUpdateInteraction({
          user: {
            user_id: session.user.user_id,
          },
          course: {
            courseId: courseDetaill,
          },
          interaction_type: InteractionType.VIEW,
        });
      } catch (error) {
        console.error("Error creating interaction:", error);
      }
    }
    router.push(`/${locale}/courseDetail/${courseDetaill}`);
  };
  return (
    <>
      <Banner />
      <div className="main-container">
        <div className="header-section">
   
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            loop={true}
            breakpoints={{
              600: {
                slidesPerView: 1,
              },
              740: {
                slidesPerView: 2,
              },
              840: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
          >
            <SwiperSlide className="course-name">
              <Image
                className="course-img"
                src={logoJs}
                alt="JavaScript"
                width={45}
                height={45}
              />
              JavaScript
            </SwiperSlide>
            <SwiperSlide className="course-name">
              <Image src={logoSQL} alt="SQL" width={50} height={50} />
              SQL
            </SwiperSlide>
            <SwiperSlide className="course-name">
              <Image
                className="course-img"
                src={logoCSharp}
                alt="C Sharp"
                width={50}
                height={50}
              />
              C#
            </SwiperSlide>
            <SwiperSlide className="course-name">
              <Image
                className="course-img"
                src={logoJava}
                alt="Java"
                width={50}
                height={50}
              />
              Java
            </SwiperSlide>
            <SwiperSlide className="course-name">
              <Image
                className="course-img"
                src={logoCPlusPlus}
                alt="C++"
                width={50}
                height={50}
              />
              C++
            </SwiperSlide>
            <SwiperSlide className="course-name">
              <Image
                className="course-img"
                src={logoNodeJs}
                alt="NodeJs"
                width={50}
                height={50}
              />
              NodeJS
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="content-container py-5">
          <h1 className="course-title text-center mb-4">
            {t("homePageTitle")}
          </h1>
          <p className="course-description text-center mb-5">
            {t("homePageContent")}
          </p>
          <h2 className="course-title text-center mb-4">{t("recommended")}</h2>
          <div className="container">
            <div className="row g-4">
              {courses.map((course) => (
                <div key={course.courseId} className="col-md-2-4">
                  <div className="card h-100 shadow-sm hover-card">
                    <div className="position-relative card-img-wrapper">
                      {course.imageInfo ? (
                        <Image
                          src={course.imageInfo}
                          alt={course.title}
                          width={300}
                          height={400}
                          className="card-img-top"
                          style={{ objectFit: "cover", height: "150px" }}
                        />
                      ) : (
                        <Image
                          src={poster}
                          alt="Default Thumbnail"
                          width={300}
                          height={400}
                          className="card-img-top"
                          style={{ objectFit: "cover", height: "150px" }}
                        />
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h6
                        className="card-title"
                        style={{ minHeight: "48px", lineHeight: "1.4" }}
                      >
                        {course.title}
                      </h6>
                      <div className="mt-auto">
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleClick(course.courseId)}
                        >
                          {tc("4")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
