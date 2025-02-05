"use client";

import { useEffect, useState } from "react";
import "@/style/course/createCourseForm.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormControl, InputGroup } from "react-bootstrap";
import Image from "next/image";
import { Category } from "@/app/type/category/Category";
import { fetchCategories } from "@/app/api/category/CategoryAPI";
import {
  createCourse,
  fetchCourseById,
  updateCourse,
} from "@/app/api/course/CourseAPI";
import { useParams, useRouter } from "next/navigation";

const CourseForm = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(30);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  const router = useRouter();
  const { courseId } = useParams();
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (!category && !courseId && data.length)
          setCategory(data[0].categoryId);
      } catch (error) {
        console.log(error);
      }
    };

    const loadCourse = async () => {
      if (courseId) {
        const token = "your-auth-token";
        const course = await fetchCourseById(courseId as string, token);
        setCourseTitle(course.title);
        setDescription(course.description);
        setPrice(course.price);
        setCategory(course.categoryId);
        setVideoUrl(course.videoInfo);
        setPreviewUrl(course.imageInfo);
      }
    };

    loadCategories();
    if (courseId) loadCourse();
  }, [courseId]);

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
    const token = "your-auth-token";
    console.log(category)
    const courseData = {
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
      if (courseId) {
        await updateCourse(courseId as string, courseData, files, token);
        console.log("Course updated successfully");
        console.log(category)
      } else {
        await createCourse(courseData, files, token);
        console.log("Course created successfully");
      }
      router.back();
    } catch (error) {
      console.error("Error submitting course:", error);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">
        {courseId ? "EDIT COURSE" : "CREATE COURSE"}
      </h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="main-form">
          <div className="main-formLeft">
            <section>
              <h2>BASIC INFORMATION</h2>
              <label>COURSE TITLE</label>
              <input
                type="text"
                placeholder="Enter course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
              />

              <div className="description-container">
                <label>DESCRIPTION</label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  placeholder="Shortly describe this course"
                  className="quill"
                />
              </div>
            </section>

            {/* Video */}
            <section>
              <h2>VIDEO</h2>
              <div className="video-main">
                <video className="video" controls width="500">
                  {videoUrl && <source src={videoUrl} type="video/mp4" />}
                  Your browser does not support the video tag.
                </video>
                <div className="input-videoURL">
                  <p>URL</p>
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="url"
                      placeholder="Enter a valid video URL"
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

            {/* Image */}
            <section className="img-main">
              <h2>IMAGE</h2>
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
                    Drag & Drop or Click to Upload
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
            <h2>OPTIONS</h2>
            <aside className="options">
              <div>
                <h3>CATEGORY</h3>
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
                  <InputGroup.Text className="price-symbol">$</InputGroup.Text>
                  <FormControl
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="price-field"
                  />
                </InputGroup>
                <p>The recommended price is between $20 and $100</p>
              </div>
            </aside>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {courseId ? "UPDATE COURSE" : "ADD COURSE"}
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={() => router.back()}
        >
          BACK
        </button>
      </form>
    </div>
  );
};

export default CourseForm;
