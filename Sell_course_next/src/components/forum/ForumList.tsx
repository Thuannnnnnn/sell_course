import React, { useEffect, useState } from "react";
import ForumCard from "./ForumCard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getAllForum } from "@/app/api/forum/forum";
import { Forum } from "@/app/type/forum/forum";

const ForumList: React.FC = () => {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Forum');
  const [forums, setForums] = useState<Forum[]>([]);
  const [topForums, setTopForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postsPerPage] = useState<number>(3);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true);
        const forumData = await getAllForum();
        const sortedByDate = [...forumData].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setForums(sortedByDate);
        const sortedByEngagement = [...forumData].sort((a, b) => {
          const aReactions = a.reactionTopics.length;
          const aComments = a.discussions.length;
          const bReactions = b.reactionTopics.length;
          const bComments = b.discussions.length;
          const aTotal = aReactions + aComments;
          const bTotal = bReactions + bComments;
          if (aTotal === bTotal) {
            const aHasMoreReactions = aReactions > aComments;
            const bHasMoreReactions = bReactions > bComments;
            if (aHasMoreReactions && !bHasMoreReactions) return -1;
            if (!aHasMoreReactions && bHasMoreReactions) return 1;
            return bReactions - aReactions;
          }
          return bTotal - aTotal;
        });
        setTopForums(sortedByEngagement.slice(0, 3));
        setError(null);
      } catch (err) {
        setError(t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    fetchForums();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (forums.length === 0) {
    return (
      <div className="container-sm py-4">
        <h2 className="mb-4">{t('title')}</h2>
        <div className="row">
          <div className="col-md-8">
            <h4 className="mb-3">{t('latestPosts')}</h4>
            <div className="text-center my-5 p-4 border rounded bg-light">
              <p className="fs-5 mb-3">{t('noPosts')}</p>
              <p className="mb-4">{t('forumInfoDesc')}</p>
              <Link
                href={`/${locale}/forum/create`}
                className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                {t('createPost')}
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{t('forumInfo')}</h5>
              </div>
              <div className="card-body">
                <p>{t('forumInfoDesc')}</p>
                <Link
                  href={`/${locale}/forum/create`}
                  className="btn btn-primary w-100">
                  <i className="bi bi-plus-circle me-2"></i>
                  {t('createPost')}
                </Link>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">{t('statistics')}</h5>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  {t('totalPosts')}: <strong>0</strong>
                </p>
                <p className="mb-2">
                  <i className="bi bi-chat-left-text me-2"></i>
                  {t('totalComments')}: <strong>0</strong>
                </p>
                <p className="mb-0">
                  <i className="bi bi-hand-thumbs-up me-2"></i>
                  {t('totalReactions')}: <strong>0</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = forums.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(forums.length / postsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container-sm py-4">
      <h2 className="mb-4">{t('title')}</h2>
      <div className="row">
        <div className="col-md-8">
          <h4 className="mb-3">{t('latestPosts')}</h4>
          {currentPosts.map((forum) => (
            <ForumCard key={forum.forumId} forum={forum} />
          ))}
          {totalPages > 1 && (
            <nav aria-label="Phân trang diễn đàn" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước">
                    <span aria-hidden="true">«</span>
                  </button>
                </li>
                {pageNumbers.map(number => (
                  <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                    <button
                      onClick={() => paginate(number)}
                      className="page-link">
                      {number}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau">
                    <span aria-hidden="true">»</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{t('forumInfo')}</h5>
            </div>
            <div className="card-body">
              <p>{t('forumInfoDesc')}</p>
              <Link
                href={`/${locale}/forum/create`}
                className="btn btn-primary w-100">
                <i className="bi bi-plus-circle me-2"></i>
                {t('createPost')}
              </Link>
            </div>
          </div>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">{t('featuredPosts')}</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {topForums.map((forum) => (
                  <li key={forum.forumId} className="list-group-item px-0">
                    <a href="#" className="text-decoration-none">
                      {forum.title}
                    </a>
                    <div className="small text-muted mt-1">
                      <span className="me-2">
                        <i className="bi bi-chat-left-text me-1"></i>
                        {forum.discussions.length} {t('comments')}
                      </span>
                      <span>
                        <i className="bi bi-hand-thumbs-up me-1"></i>
                        {forum.reactionTopics.length} {t('likes')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">{t('statistics')}</h5>
            </div>
            <div className="card-body">
              <p className="mb-2">
                <i className="bi bi-file-earmark-text me-2"></i>
                {t('totalPosts')}: <strong>{forums.length}</strong>
              </p>
              <p className="mb-2">
                <i className="bi bi-chat-left-text me-2"></i>
                {t('totalComments')}: <strong>{forums.reduce((total, forum) => total + forum.discussions.length, 0)}</strong>
              </p>
              <p className="mb-0">
                <i className="bi bi-hand-thumbs-up me-2"></i>
                {t('totalReactions')}: <strong>{forums.reduce((total, forum) => total + forum.reactionTopics.length, 0)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumList;