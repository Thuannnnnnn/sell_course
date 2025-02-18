'use client';
import Sidebar from '@/components/SideBar';
import { useEffect, useState } from 'react';
import { fetchCoursesAdmin } from '@/app/api/course/CourseAPI';
import CourseList from '@/components/course/courseListAdmin';
import '@/style/courseAdmin.css';
import { useTranslations } from 'next-intl';
import { Course } from '@/app/type/course/Course';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import {
  NotificationContainer,
  NotificationManager,
} from 'react-notifications';
import { useSession } from 'next-auth/react';
export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const t = useTranslations('courses');
  const { data: session } = useSession();

  const router = useRouter();
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return;
        }
        const data = await fetchCoursesAdmin(token);
        setCourses(data);
        console.log('Loaded courses:', data);
      } catch (error) {
        console.log('Loaded courses error:', error);
      } finally {
      }
    };

    loadCourses();
  }, [session]);

  useEffect(() => {
    const successMessage = localStorage.getItem('courseSuccess');
    if (successMessage) {
      createNotification("success", "Thao tác thành công!")();
      localStorage.removeItem("courseSuccess");
    }
  }, []);

  const createNotification = (
    type: 'info' | 'success' | 'warning' | 'error',
    message: string
  ) => {
    return () => {
      switch (type) {
        case 'info':
          NotificationManager.info(message || 'Info message');
          break;
        case 'success':
          NotificationManager.success(message || 'Success!');
          break;
        case 'warning':
          NotificationManager.warning(message || 'Warning!', 3000);
          break;
        case 'error':
          NotificationManager.error(message || 'Error occurred', 5000);
          break;
      }
    };
  };

  return (
    <div className="d-flex">
      <div className="sidebar-page">
        <Sidebar />
      </div>
      <div className="layout-right">
        <div className="layout-rightHeader">
          <h3>{t('course')}</h3>
          <Button
            className="button-create"
            onClick={() => router.push('courseAdmin/add')}
          >
            <span className="icon">+</span>
            {t('create')}
          </Button>
        </div>
        <CourseList courses={courses} setCourses={setCourses} />
      </div>
      <NotificationContainer />
    </div>
  );
}
