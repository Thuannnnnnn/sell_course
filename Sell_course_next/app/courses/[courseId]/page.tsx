
import courseApi from "@/app/api/courses/courses";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await courseApi.getCourseById(params.courseId);
  // Lấy các khóa học cùng category
  const relatedCourses = (
    await courseApi.getCoursesByCategory(course.categoryId)
  ).filter((c) => c.courseId !== course.courseId);

  return (
    <div className="bg-[#f8f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header + Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Header (main info) */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {course.short_description}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={course.instructorAvatar || "/logo.png"}
                alt={course.instructorName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{course.instructorName}</span>
              <span className="text-yellow-500 font-semibold flex items-center">
                ★ {course.rating}
              </span>
              <span className="text-gray-400 text-sm">{course.level}</span>
            </div>
            <div className="text-gray-400 text-sm mb-2">
              {course.duration} hours • Last updated:{" "}
              {new Date(course.updatedAt).toLocaleDateString()}
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
              <div className="mb-4 text-gray-600 text-base">
                {course.short_description}
              </div>
              <div className="text-3xl font-bold mb-2 text-blue-700">
                ${course.price}
              </div>
              <Button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mb-2">
                Enroll Now
              </Button>
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
              <div className="text-gray-400 col-span-3">
                No related courses found.
              </div>
            )}
            {relatedCourses.map((rc) => (
              <div
                key={rc.courseId}
                className="bg-white rounded-xl shadow p-3 hover:shadow-lg transition"
              >
                <Image
                  src={rc.thumbnail || "/logo.png"}
                  alt={rc.title}
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="font-semibold text-lg mb-1">{rc.title}</div>
                <div className="text-gray-500 text-sm mb-1">
                  {rc.instructorName}
                </div>
                <div className="text-blue-600 font-bold mb-2">${rc.price}</div>
                <a
                  href={`/courses/${rc.courseId}`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Course
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
