"use client";

import React, { useState, useRef, useEffect } from "react";
import {updateForum, getForumById } from "@/app/api/forum/forum";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { CreateForumDto, Forum } from "@/app/type/forum/forum";

interface EditForumFormProps {
  forumId: string;
}

const EditForumForm: React.FC<EditForumFormProps> = ({ forumId }) => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { data: session, status } = useSession();
  const t = useTranslations('Forum');

  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [originalForum, setOriginalForum] = useState<Forum | null>(null);

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

  useEffect(() => {
    const fetchForumData = async () => {
      if (!forumId) return;

      try {
        setLoading(true);
        const forum = await getForumById(forumId);

        if (!forum) {
          setError(t('postNotFound'));
          return;
        }

        setOriginalForum(forum);
        setTitle(forum.title);
        setText(forum.text);

        if (forum.image) {
          setImagePreview(forum.image);
        }

        if (session?.user?.user_id !== forum.user.user_id) {
          setError(t('noPermissionMessage'));
        }

      } catch (err) {
        setError(t('errorUpdatingPost'));
      } finally {
        setLoading(false);
      }
    };

    if (forumId && session) {
      fetchForumData();
    }
  }, [forumId, session, t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageFormats'));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError(t('imageFormats'));
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
    setImagePreview(originalForum?.image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t('titleRequired'));
      return;
    }

    if (!text.trim()) {
      setError(t('contentRequired'));
      return;
    }

    if (!userId) {
      setError(t('userIdRequired'));
      return;
    }

    const token = session?.user?.token;
    if (!token) {
      setError(t('tokenRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const forumData: CreateForumDto = {
        userId: userId,
        title: title.trim(),
        text: text.trim(),
        image: image
      };

      const result = await updateForum(forumId, forumData, token);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/forum/${forumId}`);
        }, 2000);
      } else {
        setError(t('errorUpdatingPost'));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`${t('errorUpdatingPost')}: ${err.message}`);
      } else {
        setError(t('errorUpdatingPost'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">{t('loginRequired')}</h4>
          <p>{t('loginRequiredMessage')}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/${locale}/auth/login`)}
            >
              {t('loginRequired')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (originalForum && session?.user?.user_id !== originalForum.user.user_id) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">{t('noPermission')}</h4>
          <p>{t('noPermissionMessage')}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/${locale}/forum/${forumId}`)}
            >
              {t('backToForum')}
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
              <h4 className="mb-0">{t('editPost')}</h4>
            </div>
            <div className="card-body">
              {success ? (
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">{t('postUpdatedSuccess')}</h4>
                  <p>{t('postUpdatedMessage')}</p>
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
                      {t('postTitle')} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('postTitle')}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      {t('postContent')} <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="content"
                      rows={6}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t('postContent')}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="image" className="form-label">
                      {t('postImage')}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                    <div className="form-text">
                      {t('imageFormats')}
                    </div>

                    {imagePreview && (
                      <div className="mt-3 position-relative">
                        <div className="img-thumbnail" style={{ maxHeight: "200px", position: "relative", width: "100%", height: "200px" }}>
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          onClick={handleRemoveImage}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => router.push(`/${locale}/forum/${forumId}`)}
                    >
                      <i className="bi bi-arrow-left me-1"></i> {t('backButton')}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {t('processing')}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-1"></i> {t('saveChanges')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditForumForm;