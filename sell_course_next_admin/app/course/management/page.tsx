'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  FileText,
  Loader2
} from 'lucide-react';
import { getCoursesByStatus } from '../../api/courses/course';
import { Course, CourseStatus } from '../../types/course.d';

export default function CourseManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<{
    draft: Course[];
    pending: Course[];
    published: Course[];
    rejected: Course[];
    archived: Course[];
  }>({
    draft: [],
    pending: [],
    published: [],
    rejected: [],
    archived: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const [draft, pending, published, rejected, archived] = await Promise.all([
          getCoursesByStatus(CourseStatus.DRAFT, session.accessToken),
          getCoursesByStatus(CourseStatus.PENDING_REVIEW, session.accessToken),
          getCoursesByStatus(CourseStatus.PUBLISHED, session.accessToken),
          getCoursesByStatus(CourseStatus.REJECTED, session.accessToken),
          getCoursesByStatus(CourseStatus.ARCHIVED, session.accessToken)
        ]);

        setCourses({ draft, pending, published, rejected, archived });
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case CourseStatus.PENDING_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case CourseStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case CourseStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case CourseStatus.ARCHIVED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.DRAFT:
        return <FileText className="h-4 w-4" />;
      case CourseStatus.PENDING_REVIEW:
        return <Clock className="h-4 w-4" />;
      case CourseStatus.PUBLISHED:
        return <CheckCircle className="h-4 w-4" />;
      case CourseStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case CourseStatus.ARCHIVED:
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          <Badge className={`ml-2 ${getStatusColor(course.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(course.status)}
              {course.status}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {course.short_description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">${course.price}</span> • {course.duration} min
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (course.status === CourseStatus.PENDING_REVIEW) {
                router.push(`/course/review/${course.courseId}`);
              } else {
                router.push(`/course/${course.courseId}`);
              }
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            {course.status === CourseStatus.PENDING_REVIEW ? 'Review' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Manage and review courses by their current status
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {courses.pending.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {courses.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            {courses.published.length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white">
                {courses.published.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft
            {courses.draft.length > 0 && (
              <Badge className="ml-2 bg-gray-500 text-white">
                {courses.draft.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {courses.rejected.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {courses.rejected.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            {courses.archived.length > 0 && (
              <Badge className="ml-2 bg-purple-500 text-white">
                {courses.archived.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.pending.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
          {courses.pending.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses pending review</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.published.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
          {courses.published.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No published courses</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.draft.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
          {courses.draft.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No draft courses</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.rejected.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
          {courses.rejected.length === 0 && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rejected courses</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.archived.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
          {courses.archived.length === 0 && (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No archived courses</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
