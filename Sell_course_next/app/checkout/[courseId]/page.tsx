"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import courseApi from "@/app/api/courses/courses";
import {
  createPaymentLinkAPI,
  checkPaymentStatusAPI,
} from "@/app/api/Payment/payment";
import { CourseResponseDTO } from "@/app/types/Course/Course";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSession } from "next-auth/react";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";
import { DiscountCode } from "@/components/checkout/DiscountCode";
import { CourseList } from "@/components/checkout/CourseList";
import logo from "@/public/logo.png";

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.courseId;
  const [course, setCourse] = useState<CourseResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [discount, setDiscount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          setIsLoading(true);
          const fetchedCourse = await courseApi.getCourseById(
            courseId as string
          );
          setCourse(fetchedCourse);
        } catch {
          setError("Failed to fetch course details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourse();
    }
  }, [courseId]);

  const handlePayment = async () => {
    if (course && session?.user?.email) {
      try {
        setIsLoading(true);
        const paymentResponse = await createPaymentLinkAPI({
          courseId: courseId as string,
          email: session?.user?.email,
        });
        setQrCodeData(paymentResponse.qrCode);
        setCheckoutUrl(paymentResponse.checkoutUrl);
        setOrderCode(paymentResponse.orderCode);
      } catch {
        setError("Failed to create payment link.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const checkPaymentStatus = async () => {
    if (orderCode) {
      try {
        const response = await checkPaymentStatusAPI(orderCode);
        if (response.paymentStatus === "paid") {
          setIsPaymentCompleted(true);
        }
      } catch (error) {
        console.error("Failed to check payment status:", error);
      }
    }
  };

  const handleCheckPaymentStatus = () => {
    if (orderCode) {
      checkPaymentStatus();
    }
  };
  const handleApplyDiscount = (amount: number) => {
    setDiscount(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (isPaymentCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="mt-4 text-lg">
          Thank you for your purchase. You can now access your course.
        </p>
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full text-lg py-6"
            // onClick={() => (window.location.href = `/courses/${courseId}`)}
          >
            Go to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="container max-w-6xl px-4 py-8 md:py-12">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Confirm Your Order
          </h1>
          <p className="text-muted-foreground">
            Please review your course and total before proceeding to payment
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-[1fr_400px]">
          <div className="space-y-8">
            {course && (
              <CourseList
                courses={[
                  {
                    id: course.courseId,
                    title: course.title,
                    instructor: course.instructorName || "Unknown",
                    duration: course.duration ? String(course.duration) : "N/A",
                    price: course.price,
                    image: course.thumbnail || "/placeholder.png",
                    originalPrice: course.price,
                  },
                ]}
              />
            )}
            <DiscountCode onApplyDiscount={handleApplyDiscount} />
          </div>
          <div className="space-y-6">
            {course && (
              <PaymentSummary
                subtotal={course.price}
                discount={(course.price * discount) / 100}
                total={course.price - (course.price * discount) / 100}
              />
            )}
            {qrCodeData ? (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Scan the QR Code</h2>
                <QRCodeSVG
                  value={qrCodeData}
                  size={256}
                  imageSettings={{
                    src: logo.src,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline mt-4"
                  >
                    Or click here to proceed to payment
                  </a>
                )}
                <Button
                  size="lg"
                  className="w-full text-lg py-6"
                  onClick={handleCheckPaymentStatus}
                >
                  Check Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full text-lg py-6"
                  onClick={handlePayment}
                >
                  Proceed to Payment
                </Button>
                <div className="flex items-center justify-center text-sm text-muted-foreground gap-1">
                  <Lock className="h-4 w-4" />
                  <span>All transactions are secure</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
