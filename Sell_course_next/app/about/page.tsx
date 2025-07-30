import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are passionate about transforming education through innovative online learning solutions. 
            Our mission is to make high-quality education accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              Our mission is to democratize education by providing exceptional online courses that empower learners 
              to achieve their personal and professional goals. We believe that learning should be engaging, 
              accessible, and transformative for everyone, regardless of their background or location.
            </p>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-green-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              We envision a world where quality education is not limited by geographical boundaries, financial constraints, 
              or traditional institutional barriers. Our goal is to become the leading platform that connects passionate 
              educators with eager learners, fostering a global community of continuous learning and growth.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-purple-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  We are committed to delivering the highest quality courses and learning experiences 
                  that exceed our students&apos; expectations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously embrace new technologies and methodologies to enhance the learning 
                  experience and stay ahead of educational trends.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  We believe education should be affordable and accessible to everyone, breaking down 
                  barriers that prevent people from learning.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Community</h3>
                <p className="text-gray-600">
                  We foster a supportive learning community where students and instructors can connect, 
                  collaborate, and grow together.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Offer Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-orange-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              What We Offer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Comprehensive Courses:</span> Wide range of subjects from technology 
                  and business to arts and personal development, designed by industry experts.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Interactive Learning:</span> Engaging video lectures, hands-on projects, 
                  quizzes, and assignments that make learning effective and enjoyable.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Expert Instructors:</span> Learn from experienced professionals and 
                  thought leaders who bring real-world expertise to every lesson.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Flexible Learning:</span> Study at your own pace, on any device, 
                  with lifetime access to course materials and updates.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold">Certificates:</span> Earn industry-recognized certificates upon 
                  course completion to showcase your new skills and knowledge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Story Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-indigo-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Our Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Founded with the belief that everyone deserves access to quality education, our platform was born from 
              the recognition that traditional educational systems often fall short of meeting the diverse needs of 
              modern learners. We started as a small team of educators and technologists who shared a common vision: 
              to create an online learning environment that is both comprehensive and accessible.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Today, we have grown into a thriving educational community that serves thousands of students worldwide. 
              Our courses are carefully crafted by subject matter experts and continuously updated to reflect the 
              latest industry trends and best practices. We take pride in our student-centric approach, ensuring that 
              every learner receives the support and resources they need to succeed.
            </p>
          </CardContent>
        </Card>

        {/* Commitment Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-teal-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              We are committed to your success. Our dedicated support team is always ready to assist you with any 
              questions or challenges you may encounter during your learning journey. We believe that education is 
              not just about acquiring knowledge, but about transforming lives and opening doors to new opportunities.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Join us today and become part of a learning community that values growth, innovation, and success. 
              Together, we can unlock your potential and help you achieve your goals through the power of education.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
