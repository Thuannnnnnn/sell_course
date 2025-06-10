"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import courseApi from "@/app/api/courses/courses";
import { CourseResponseDTO } from "@/app/types/Course/Course";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";

export default function CheckoutPage() {
  const params = useParams();
  const courseId = params.courseId;
  const [course, setCourse] = useState<CourseResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handlePayment = () => {
    if (course) {
      console.log("Processing payment for course:", course);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading..{courseId ? ` Course ID: ${courseId}` : ""}
        <div className="text-muted-foreground">Please wait...</div>
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
              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
                <p className="text-lg font-bold mt-2">${course.price}</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            {course && (
              <PaymentSummary
                subtotal={course.price}
                discount={0}
                total={course.price}
              />
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
