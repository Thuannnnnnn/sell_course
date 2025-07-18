"use client";

import courseApi from "@/app/api/courses/courses";
import { checkEnrollmentServer } from "@/app/api/enrollment/enrollment";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/ui/CourseCard";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CourseResponseDTO, CourseCardData } from "@/app/types/Course/Course";
import Link from "next/link";
import {
  Play,
  Clock,
  Award,
  Star,
  CheckCircle,
  BookOpen,
  User,
  Globe,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CourseDetailPageProps {
  params: { courseId: string };
}

export default function UpdatedCourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const [course, setCourse] = useState<CourseResponseDTO | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseApi.getCourseById(params.courseId);
        setCourse(courseData);
        const related = (
          await courseApi.getCoursesByCategory(courseData.categoryId)
        ).filter((c) => c.courseId !== courseData.courseId);
        setRelatedCourses(related);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseData();
  }, [params.courseId]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (status === "loading") return;
      if (session?.user && params.courseId) {
        try {
          setIsCheckingEnrollment(true);
          const response = await checkEnrollmentServer(params.courseId);
          setIsEnrolled(response.enrolled);
        } catch (error) {
          console.error("Error checking enrollment:", error);
        } finally {
          setIsCheckingEnrollment(false);
        }
      } else {
        setIsCheckingEnrollment(false);
      }
    };
    checkEnrollment();
  }, [session, status, params.courseId]);

  const convertToCourseCardData = (
    course: CourseResponseDTO
  ): CourseCardData => ({
    id: course.courseId,
    title: course.title,
    instructor: course.instructorName,
    price: `$${course.price}`,
    rating: course.rating,
    image: course.thumbnail || "/logo.png",
    description: course.short_description,
    level: course.level,
    duration: course.duration,
  });

  const courseFeatures = [
    {
      icon: <Clock className="w-5 h-5" />,
      text: `${course?.duration || 0} hours on-demand video`,
    },
    { icon: <BookOpen className="w-5 h-5" />, text: "Downloadable resources" },
    { icon: <Award className="w-5 h-5" />, text: "Certificate of completion" },
    { icon: <Globe className="w-5 h-5" />, text: "Lifetime access" },
    { icon: <Download className="w-5 h-5" />, text: "Access on mobile and TV" },
  ];

  const renderActionButton = () => {
    if (status === "loading" || isCheckingEnrollment) {
      return (
        <Button
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        </Button>
      );
    }

    if (!session) {
      return (
        <Link href="/auth/login" className="block w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Login to Enroll
          </Button>
        </Link>
      );
    }

    if (isEnrolled || session.user.role === "ADMIN") {
      return (
        <Link href={`/enrolled/${params.courseId}`} className="block w-full">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Enrolled
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/checkout/${params.courseId}`} className="block w-full">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Buy Course Now
        </Button>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">
            Loading course...
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-2xl font-bold text-red-600 mb-2">
            Course not found
          </div>
          <div className="text-gray-600">
            The course you are looking for does not exist
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        <div className="relative z-10">
          {/* Hero Section */}
          <div className="container mx-auto px-6 pt-8 pb-12">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Course Header */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-700">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {course.short_description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      <Image
                        src={course.instructorAvatar || "/logo.png"}
                        alt={course.instructorName}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="font-medium">
                        {course.instructorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{course.duration} hours</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {new Date(course.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
                  <div className="flex gap-2">
                    {["overview"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Course Overview
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {course.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mt-8">
                        {courseFeatures.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                          >
                            <div className="text-blue-600">{feature.icon}</div>
                            <span className="text-gray-700 font-medium">
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Courses */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">
                    Students Also Bought
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedCourses.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No related courses found.</p>
                      </div>
                    ) : (
                      relatedCourses.map((rc) => (
                        <CourseCard
                          key={rc.courseId}
                          course={convertToCourseCardData(rc)}
                          showWishlistButton={false}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Course Preview */}
                    <div className="relative mb-6 group">
                      {course.videoIntro ? (
                        <video
                          src={course.videoIntro}
                          controls
                          className="w-full h-48 object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden">
                          <Image
                            src="/logo.png"
                            alt="Course preview"
                            width={200}
                            height={200}
                            className="object-contain opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Play className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {course.price} VND
                      </div>
                      <p className="text-gray-600">
                        {course.short_description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-6 space-y-3">{renderActionButton()}</div>

                    {/* Course Features */}
                    <div className="space-y-3 mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        This course includes:
                      </h4>
                      {courseFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-gray-700"
                        >
                          <div className="text-green-600">{feature.icon}</div>
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                        <CheckCircle className="w-5 h-5" />
                        30-Day Money-Back Guarantee
                      </div>
                      <p className="text-sm text-green-600">
                        Full refund if you are not satisfied
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
