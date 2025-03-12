"use client";

import React, { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { CreateForumDto } from "@/app/type/forum/forum";
import { createForum } from "@/app/api/forum/forum";
import { FaTrash } from "react-icons/fa";

const CreateForumForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { data: session, status } = useSession();
  const t = useTranslations("Forum");

  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
    }

    if (session) {
      if (session.user?.user_id) {
        setUserId(session.user.user_id);
      } else if (session.user?.id) {
        setUserId(session.user.id);
      } else if (session.user_id) {
        setUserId(session.user_id);
      }
    }
  }, [session, status, router, locale]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("imageFormats"));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError(t("imageFormats"));
        return;
      }

      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t("titleRequired"));
      return;
    }

    if (!text.trim()) {
      setError(t("contentRequired"));
      return;
    }

    if (!userId) {
      setError(t("userIdRequired"));
      return;
    }

    const token = session?.user?.token;
    if (!token) {
      setError(t("tokenRequired"));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const forumData: CreateForumDto = {
        userId: userId,
        title: title.trim(),
        text: text.trim(),
        image: image || undefined,
      };

      const result = await createForum(forumData, token);

      if (result) {
        setSuccess(true);

        setTimeout(() => {
          router.push(`/${locale}/forum`);
        }, 2000);
      } else {
        setError(t("errorCreatingPost"));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`${t("errorCreatingPost")}: ${err.message}`);
      } else {
        setError(t("errorCreatingPost"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">{t("loginRequired")}</h4>
          <p>{t("loginRequiredMessage")}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/${locale}/auth/login`)}
            >
              {t("loginRequired")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{t("createNewPost")}</h4>
            </div>
            <div className="card-body">
              {success ? (
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">{t("postCreatedSuccess")}</h4>
                  <p>{t("postCreatedMessage")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      {t("postTitle")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("postTitle")}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      {t("postContent")} <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="content"
                      rows={6}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t("postContent")}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="image" className="form-label">
                      {t("postImage")}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                    <div className="form-text">{t("imageFormats")}</div>

                    {imagePreview && (
                      <div className="mt-3 position-relative">
                        <div
                          className="img-thumbnail"
                          style={{
                            maxHeight: "200px",
                            position: "relative",
                            width: "100%",
                            height: "200px",
                          }}
                        >
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <button
                          title="Remove image"
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          onClick={handleRemoveImage}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => router.push(`/${locale}/forum`)}
                    >
                      <i className="bi bi-arrow-left me-1"></i>{" "}
                      {t("backButton")}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {t("processing")}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-1"></i> {t("submitPost")}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">{t("guidelines")}</h5>
            </div>
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">
                {t("postingRules")}
              </h6>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item px-0">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {t("rule1")}
                </li>
                <li className="list-group-item px-0">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {t("rule2")}
                </li>
                <li className="list-group-item px-0">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {t("rule3")}
                </li>
                <li className="list-group-item px-0">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  {t("rule4")}
                </li>
              </ul>

              <h6 className="card-subtitle mb-2 text-muted">
                {t("formatting")}
              </h6>
              <p className="small">{t("formattingTip")}</p>
              <ul className="small">
                <li>{t("boldFormat")}</li>
                <li>{t("italicFormat")}</li>
                <li>{t("headingFormat")}</li>
              </ul>
            </div>
          </div>

          <div className="d-grid">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => router.push(`/${locale}/forum`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              {t("backToForum")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForumForm;
