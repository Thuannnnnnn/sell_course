"use client";
import React, { useEffect, useState } from "react";
import { fetchOrderHistory } from "@/app/api/orderHistory/orderHistory";
import { useSession } from "next-auth/react";
import DashBoardUser from "@/components/DashBoardUser";
import BannerUser from "@/components/BannerUser";
import SignIn from "../../auth/login/page";
import "../../../../style/UserProfilePage.css";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Course {
  courseId: string;
  title: string;
  description: string;
  imageInfo: string;
  price: number;
  videoInfo: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  course: Course;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(session?.user || null);
  const t = useTranslations('orderHistoryPage');
  const token = session?.user?.token;
  const email = session?.user?.email;

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || !session.user.user_id) {
      setError("User not found or unauthorized.");
      setLoading(false);
      return;
    }
    setUser(session.user);
  }, [session, status]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token || !email) return;
        const data = await fetchOrderHistory(token, email);
        console.log("API Response:", data);

        interface ApiOrder {
          id: string;
          amount: number;
          paymentStatus?: string;
          createdAt: string;
          course: Course;
        }

        const formattedOrders = data.map((order: ApiOrder) => ({
          id: order.id,
          total: order.amount,
          status: order.paymentStatus || "UNKNOWN",
          createdAt: order.createdAt,
          course: order.course,
        }));

        setOrders(formattedOrders);
      } catch {
        setError("Failed to load order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, email, token]);

  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile container">
          <h1>{t('title')}</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <div>
              {loading ? (
                  <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                      </div>
                  </div>
              ) : error ? (
                  <p className="text-danger text-center">{error}</p>
              ) : orders && orders.length > 0 ? (
                  <div className="row">
                      {orders.map((order) => (
                          <div key={order.id} className="col-md-6 col-lg-4 mb-4 mt-4">
                              <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                                  <Image
                                      src={order.course.imageInfo}
                                      alt="Course Thumbnail"
                                      width={300}
                                      height={160}
                                      className="card-img-top object-fit-cover"
                                  />
                                  <div className="card-body">
                                      <h5 className="card-title text-truncate">{order.course.title}</h5>
                                      <p className="card-text">
                                          <strong>Order ID:</strong> {order.id} <br />
                                          <strong>Amount:</strong> <span className="fw-bold text-primary">${order.total.toFixed(2)}</span> <br />
                                          <strong>Status:</strong> <span className={`badge ${order.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.status}</span> <br />
                                          <strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString()}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-muted fs-5">{t('noOrder')}</p>
              )}
          </div>
        </div>
    </div>
    </>
  );
};

export default OrderHistoryPage;
