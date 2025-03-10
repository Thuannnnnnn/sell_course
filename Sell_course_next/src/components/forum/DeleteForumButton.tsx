"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal, Button } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { deleteForum } from "@/app/api/forum/forum";

interface DeleteForumButtonProps {
  forumId: string;
  userId: string;
  locale: string;
}

const DeleteForumButton: React.FC<DeleteForumButtonProps> = ({
  forumId,
  userId,
  locale,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations('Forum');
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async () => {
    if (session?.user?.user_id !== userId) {
      setError(t('noPermissionMessage'));
      return;
    }

    const token = session?.user?.token;
    if (!token) {
      setError(t('tokenRequired'));
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const success = await deleteForum(forumId, token);

      if (success) {
        router.push(`/${locale}/forum`);
      } else {
        setError(t('errorDeletingPost'));
        handleCloseModal();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`${t('errorDeletingPost')}: ${err.message}`);
      } else {
        setError(t('errorDeletingPost'));
      }
      handleCloseModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = session?.user?.user_id === userId;

  if (!isAuthor) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-outline-danger"
        onClick={handleShowModal}
        title={t('deletePost')}
      >
        <i className="bi bi-trash me-1"></i> {t('deletePost')}
      </button>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <p>
              {t('confirmDeleteMessage')}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={isDeleting}
          >
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {t('deleting')}
              </>
            ) : (
              t('confirm')
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteForumButton;
