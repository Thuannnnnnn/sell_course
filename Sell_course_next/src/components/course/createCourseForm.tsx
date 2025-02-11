"use client";

import { useEffect, useState } from "react";
import "@/style/createCourseForm.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormControl, InputGroup } from "react-bootstrap";
import Image from "next/image";
import "react-notifications/lib/notifications.css";
import { Category } from "@/app/type/category/Category";
import { fetchCategories } from "@/app/api/category/CategoryAPI";
import {
  createCourse,
  fetchCourseById,
  fetchCourseByIdAdmin,
  updateCourse,
} from "@/app/api/course/CourseAPI";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { useSession } from "next-auth/react";
import { IoMdArrowBack } from "react-icons/io";
const CourseForm = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(10000);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const t = useTranslations("coursesForm");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;
  const { data: session } = useSession();

  const { courseId } = useParams();
  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (!session?.user.token) {
          return;
        }
        const data = await fetchCategories(session?.user.token);
        setCategories(data);
        if (!category && !courseId && data.length)
          setCategory(data[0].categoryId);
      } catch (error) {
        console.log(error);
      }
    };

    const loadCourse = async () => {
      if (courseId) {
        const token = session?.user.token;
        if (!token) {
          return;
        }
        const course = await fetchCourseByIdAdmin(courseId as string, token);
        setCourseTitle(course.title);
        setDescription(course.description);
        setPrice(course.price);
        setCategory(course.categoryId);
        setVideoUrl(course.videoInfo);
        setPreviewUrl(course.imageInfo);
      }
    };

    loadCategories();
    if (session) {
      console.log(session.user);
    }
    if (courseId) loadCourse();
  }, [courseId, session, category]);

  useEffect(() => {
    if (image && typeof window !== "undefined") {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImage(file);
    }
  };

  const validateInputs = () => {
    if (!courseTitle.trim()) {
      createNotification("error", t("errorTitle"))();
      return false;
    }

    if (!description.trim()) {
      createNotification("error", t("errorDescription"))();
      return false;
    }

    if (!category) {
      createNotification("error", t("errorCategory"))();
      return false;
    }

    if (!price || price <= 0) {
      createNotification("error", t("errorPrice"))();
      return false;
    }

    if (!image && !courseId) {
      createNotification("error", t("errorImage"))();
      return false;
    }

    if (!videoUrl && !courseId) {
      createNotification("error", t("errorVideo"))();
      return false;
    }

    return true;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (newValue > 10000) {
      setPrice(newValue);
    } else {
      NotificationManager.error(
        "Giá phải lớn hơn 10000",
        "Lỗi nhập liệu",
        2000
      );
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.user.token;
    const user_id = session?.user.user_id;
    if (!validateInputs()) return;
    const courseData = {
      user_id: user_id,
      title: courseTitle,
      description,
      price,
      categoryId: category,
    };

    const files = {
      imageInfo: image || undefined,
      videoInfo: video || undefined,
    };

    try {
      if (token) {
        if (courseId) {
          await updateCourse(courseId as string, courseData, files, token);
          localStorage.setItem("courseSuccess", "true");
          router.push(`/${locale}/admin/courseAdmin/`);
        } else {
          await createCourse(courseData, files, token);
          localStorage.setItem("courseUpdate", "true");
          router.push(`/${locale}/admin/courseAdmin/`);
        }
      }
    } catch (error) {
      createNotification("error", t("errorMessage"))();
      console.error("Error submitting course:", error);
    }
  };

  const createNotification = (
    type: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info(message || "Info message");
          break;
        case "success":
          NotificationManager.success(message || "Success!");
          break;
        case "warning":
          NotificationManager.warning(message || "Warning!", 3000);
          break;
        case "error":
          NotificationManager.error(message || "Error occurred", 5000);
          break;
      }
    };
  };

  return (
    <div className="form-container">
      <h1 className="form-title">{courseId ? t("editCourse") : t("create")}</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="main-form">
          <div className="main-formLeft">
            <section>
              <h2>{t("basicInfor")}</h2>
              <label>{t("courseTitle")}</label>
              <input
                type="text"
                placeholder={t("enterCourse")}
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />

              <div className="description-container">
                <label>{t("description")}</label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  placeholder={t("enterDescription")}
                  className="quill"
                />
              </div>
            </section>

            {/* Video */}
            <section>
              <h2>{t("video")}</h2>
              <div className="video-main">
                <video className="video" controls width="500">
                  {videoUrl && <source src={videoUrl} type="video/mp4" />}
                  {t("videoNotify")}
                </video>
                <div className="input-videoURL">
                  <p>{t("url")}</p>
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="url"
                      placeholder={t("enterURL")}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ marginTop: "10px" }}
                />
              </div>
            </section>

            <section className="img-main">
              <h2>{t("image")}</h2>
              <div
                className="image-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Uploaded"
                    layout="fill"
                    objectFit="cover"
                    className="preview-container"
                  />
                ) : (
                  <label htmlFor="file-upload" className="upload-label">
                    {t("imgNotify")}
                  </label>
                )}

                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </section>
          </div>

          <div className="main-formRight">
            <h2>{t("option")}</h2>
            <aside className="options">
              <div>
                <h3>{t("category")}</h3>
                <select
                  value={category}
                  onChange={(e) => {
                    console.log("Selected category:", e.target.value);
                    setCategory(e.target.value);
                  }}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <InputGroup className="custom-price-input">
                  <InputGroup.Text className="price-symbol">
                    VND
                  </InputGroup.Text>
                  <input
                    type="number"
                    value={price}
                    onChange={handlePriceChange}
                    className="price-field"
                  />
                </InputGroup>
                <p>{t("price")}</p>
              </div>
            </aside>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {courseId ? t("editCourse") : t("create")}
        </button>

        <button
          type="button"
          className="back-btn"


          onClick={() => router.back()}
        >
          <IoMdArrowBack />
        </button>
      </form>
      <NotificationContainer />
    </div>
  );
};

export default CourseForm;
