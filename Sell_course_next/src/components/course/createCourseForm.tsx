"use client";

import { useEffect, useState } from "react";
import "@/style/course/createCourseForm.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormControl, InputGroup } from "react-bootstrap";
import Image from "next/image";

const CreateCourseForm = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(30);
  const [category, setCategory] = useState("JavaScript");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>("");

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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      courseTitle,
      description,
      videoUrl,
      price,
      category,
      image,
    };
    console.log(formData);
  };

  return (
    <div className="form-container">
      <h1 className="form-title">CREATE COURSE</h1>
      <form onSubmit={handleSubmit}>
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
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="React">React</option>
                  <option value="NodeJS">NodeJS</option>
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
          ADD COURSE
        </button>
      </form>
    </div>
  );
};

export default CreateCourseForm;
