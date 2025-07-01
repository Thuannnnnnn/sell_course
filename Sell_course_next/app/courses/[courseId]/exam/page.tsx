'use client'

import courseApi from '@/app/api/courses/courses';
import { checkEnrollmentServer } from '@/app/api/enrollment/enrollment';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/ui/CourseCard';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { CourseResponseDTO, CourseCardData } from '@/app/types/Course/Course';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<CourseResponseDTO | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const courseData = await courseApi.getCourseById(params.courseId);
        setCourse(courseData);
        
        // Fetch related courses
        const related = (await courseApi.getCoursesByCategory(courseData.categoryId))
          .filter(c => c.courseId !== courseData.courseId);
        setRelatedCourses(related);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [params.courseId]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (status === 'loading') return; // Wait for session to load
      
      if (session?.user && params.courseId) {
        try {
          setIsCheckingEnrollment(true);
          const response = await checkEnrollmentServer(params.courseId);
          setIsEnrolled(response.enrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        } finally {
          setIsCheckingEnrollment(false);
        }
      } else {
        setIsCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [session, status, params.courseId]);

  // Convert CourseResponseDTO to CourseCardData
  const convertToCourseCardData = (course: CourseResponseDTO): CourseCardData => {
    return {
      id: course.courseId,
      title: course.title,
      instructor: course.instructorName,
      price: `$${course.price}`,
      rating: course.rating,
      image: course.thumbnail || '/logo.png',
      description: course.short_description,
      level: course.level,
      duration: course.duration
    };
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Course not found</div>
      </div>
    );
  }

  const renderActionButton = () => {
    if (status === 'loading' || isCheckingEnrollment) {
      return (
        <Button disabled className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold transition mb-2">
          Loading...
        </Button>
      );
    }

    if (!session) {
      return (
        <Link href="/auth/login">
          <Button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mb-2">
            Login to Enroll
          </Button>
        </Link>
      );
    }

    if (isEnrolled) {
      return (
        <Button disabled className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold transition mb-2">
          ✓ Enrolled
        </Button>
      );
    }

    return (
      <Link href={`/checkout/${params.courseId}`}>
        <Button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mb-2">
          Buy Course
        </Button>
      </Link>
    );
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header + Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Header (main info) */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{course.short_description}</p>
            <div className="flex items-center gap-4 mb-4">
              <Image src={course.instructorAvatar || '/logo.png'} alt={course.instructorName} width={40} height={40} className="rounded-full" />
              <span className="font-medium">{course.instructorName}</span>
              <span className="text-yellow-500 font-semibold flex items-center">★ {course.rating}</span>
              <span className="text-gray-400 text-sm">{course.level}</span>
            </div>
            <div className="text-gray-400 text-sm mb-2">
              {course.duration} hours • Last updated: {new Date(course.updatedAt).toLocaleDateString()}
            </div>
          </div>
          {/* Sidebar (purchase) */}
          <div className="w-full md:w-96">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {course.videoIntro ? (
                <video
                  src={course.videoIntro}
                  controls
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              ) : (
                <Image
                  src="/logo.png"
                  alt="default logo"
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <div className="mb-4 text-gray-600 text-base line-clamp-3 overflow-hidden text-ellipsis">
                {course.short_description}
              </div>
              <div className="text-3xl font-bold mb-2 text-blue-700">{course.price}VND</div>
              {renderActionButton()}
              <ul className="mt-4 text-sm text-gray-500 space-y-1">
                <li>✔ {course.duration} hours on-demand video</li>
                <li>✔ Certificate of completion</li>
                <li>✔ Lifetime access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs (Overview, Curriculum, Instructor, Reviews) */}
        <div className="mt-10 bg-white rounded-2xl shadow p-8">
          {/* Tabs component ở đây, có thể dùng state để chuyển tab */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p>{course.description}</p>
          </div>
        </div>

        {/* Students Also Bought */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Students Also Bought</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCourses.length === 0 && (
              <div className="text-gray-400 col-span-3">No related courses found.</div>
            )}
            {relatedCourses.map(rc => (
              <CourseCard
                key={rc.courseId}
                course={convertToCourseCardData(rc)}
                showWishlistButton={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}