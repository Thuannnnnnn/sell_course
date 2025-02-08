"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addCoursePurchased } from "@/app/api/payment/payment";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const hasRun = useRef(false); // Chặn gọi API nhiều lần

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (hasRun.current) return; // Nếu API đã gọi thì không gọi lại nữa
      if (!session?.user?.id) return; // Chỉ gọi khi có user

      const courseIdsString = searchParams.get("courseIds");
      if (!courseIdsString) return;

      const courseIds = courseIdsString.split(",");
      const token = session?.user?.token;

      try {
        if (token && session?.user?.email) {
          await addCoursePurchased(token, session?.user?.email, courseIds);
          hasRun.current = true; // Đánh dấu đã gọi API
        } else {
          console.error("Token is undefined");
        }
      } catch (error) {
        console.error("Lỗi khi thêm khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams, session]);

  return (
    <div className="payment-success-container">
      {loading ? (
        <p>Đang xử lý thanh toán...</p>
      ) : (
        <div>
          <h2>Thanh toán thành công! 🎉</h2>
          <p>Khóa học của bạn đã được thêm vào tài khoản.</p>
          <Link href="/courses">
            <button>Quay lại khóa học</button>
          </Link>
        </div>
      )}
    </div>
  );
}
