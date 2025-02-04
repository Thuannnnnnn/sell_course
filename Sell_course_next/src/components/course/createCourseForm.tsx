"use client";

import { useState } from "react";
import "@/style/course/createCourseForm.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormControl, InputGroup } from "react-bootstrap";

const CreateCourseForm = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [price, setPrice] = useState(30);
  const [category, setCategory] = useState("JavaScript");
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
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
              <video className="video" controls>
                {videoUrl && <source src={videoUrl} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
              <input
                type="url"
                placeholder="Enter a valid video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </section>

            {/* Image */}
            <section>
              <h2>IMAGE</h2>
              <div className="image-upload">
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    className="preview-img"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
