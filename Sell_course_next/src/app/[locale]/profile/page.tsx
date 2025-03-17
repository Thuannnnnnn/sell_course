"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashBoardUser from "@/components/DashBoardUser";
import BannerUser from "@/components/BannerUser";
import "../../../style/UserProfilePage.css";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GetUser } from "@/app/type/user/User";
import SignIn from "../auth/login/page";
import { deleteWaitingList, fetchWaitingList } from "@/app/api/waitingList/waitingList";
import { FaTrash } from "react-icons/fa";
import { fetchUserDetails } from "@/app/api/auth/User/user";

interface Course {
  courseId: string;
  title: string;
  description: string;
  imageInfo: string;
  price: number;
  videoInfo: string;
  categoryName: string;
}

interface WaitingList {
  waitlistId: string;
  createdAt: string;
  course: Course;
}

const DashBoardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [waitList, setWaitList] = useState<WaitingList[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(session?.user || null);
  const t = useTranslations('waitListPage');

 useEffect(() => {
     if (status === 'loading') return; // Đợi session load xong
 
     const token = session?.user?.token;
     const email = session?.user?.email;
     if (!session?.user || !session.user.email) {
       setError('User not found or unauthorized.');
       setLoading(false);
       return;
     }
 
     console.log('Session ne: ', session.user);
 
     const fetchUser = async () => {
       setLoading(true);
       setError(null);
       try {
         const userDetails = await fetchUserDetails(token as string, email as string);
         setUser(userDetails);
       } catch {
         setError('Failed to load user details.');
       } finally {
         setLoading(false);
       }
     };
 
     fetchUser();
   }, [session, status]);

  useEffect(() => {
    const fetchWaitCourse = async () => {
      if (!session?.user?.token || !session.user.user_id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWaitingList(session.user.token, session.user.user_id);
        setWaitList(data.length ? data : null);
      } catch {
        setError("Failed to load waiting list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchWaitCourse();
  }, [session]);

  const handleDelete = async (waitlistId: string) => {
    if (!session?.user?.token) return;
    try {
      const data = await deleteWaitingList(session.user.token, waitlistId);
      console.log("API Response:", data);
      setWaitList((prev) => prev?.filter((item) => item.waitlistId !== waitlistId) || null);
    } catch (error) {
      console.error("Error deleting waitlist:", error);
      setError("Failed to delete item.");
    }
  };

  if (status === "loading") {
    return <div className="text-center py-5 fs-5">Loading...</div>;
  }

  if (!user) return <SignIn />;

  return (
    <>
      <BannerUser user={user as unknown as GetUser} />
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile container">
          <h1>{t('title')}</h1>

          {error && <div className="alert alert-danger text-center">{error}</div>}

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : waitList && waitList.length > 0 ? (
            <div className="row g-4">
              {waitList.map((waitlist) => (
                <div key={waitlist.waitlistId} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100 hover-effect position-relative">
                    <Image
                      src={waitlist.course.imageInfo}
                      alt="Course Thumbnail"
                      width={300}
                      height={160}
                      className="card-img-top object-fit-cover"
                    />
                    <div className="card-body">
                      <h5 className="card-title text-truncate fw-bold text-dark">{waitlist.course.title}</h5>
                      <p className="card-text text-muted small">
                        <strong className="text-primary">Price:</strong> ${waitlist.course.price} <br />
                        <strong className="text-success">Description:</strong> {waitlist.course.description}
                      </p>
                    </div>
                    <button
                      className="btn btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                      onClick={() => handleDelete(waitlist.waitlistId)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted fs-5">{t('noCourse')}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DashBoardPage;
