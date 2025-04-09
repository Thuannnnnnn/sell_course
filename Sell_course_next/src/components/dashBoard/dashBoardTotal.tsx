"use client";
import { fetchCoursesAdmin } from "@/app/api/course/CourseAPI";
import { CoursePurchaseAPI } from "@/app/api/coursePurchased/coursePurchased";
import { getAllForum } from "@/app/api/forum/forum";
import { fetchUsers } from "@/app/api/user/User";
import { Course } from "@/app/type/course/Course";
import { CoursePurchase } from "@/app/type/coursePurchased/coursePurchased";
import { Forum } from "@/app/type/forum/forum";
import { User } from "@/app/type/user/User";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUsers,
  FaUserCheck,
  FaBook,
  FaComments,
  FaFileExport,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAllExamResults } from "@/app/api/exam/exam";

const DashBoardTotal = () => {
  const [coursePurchasedData, setCoursePurchasedData] = useState<
    CoursePurchase[]
  >([]);
  const [forumData, setForumData] = useState<Forum[]>([]);
  const [userData, setUserData] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const t = useTranslations("dashBoard");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.token) {
        const fetchedForums = await getAllForum();
        const fetchedUsers = await fetchUsers(session.user.token);
        console.log(fetchedUsers);
        setUserData(fetchedUsers);
        const fetchedCoursesPurchased =
          await CoursePurchaseAPI.getAllPurchasesForAllUsers(
            session?.user?.token
          );
        setCoursePurchasedData(fetchedCoursesPurchased);
        setForumData(fetchedForums);
        const fetchedCourse = await fetchCoursesAdmin(session?.user?.token);
        setCourses(fetchedCourse);
      }
    };

    fetchData();
  }, [session]);

  const exportExamScoreToExcel = async () => {
    if (!session?.user?.token) {
      console.error("No token available");
      return;
    }

    try {
      // Gọi API để lấy tất cả kết quả bài kiểm tra
      const examResults = await getAllExamResults(session.user.token);

      // Tạo map để tra cứu courseName từ courseId
      const courseMap = new Map(
        courses.map((course) => [course.courseId, course.title])
      );

      // Chuẩn bị dữ liệu cho Excel
      const formattedData = examResults.map(
        (result: {
          resultExamId: string;
          email: string;
          exam: { courseId: string };
          score: number;
          createdAt: string | number | Date;
        }) => ({
          ResultExamId: result.resultExamId,
          UserEmail: result.email,
          CourseName: courseMap.get(result.exam.courseId) || "Unknown Course", // Thay courseId bằng courseName
          Score: result.score,
          CreatedAt: new Date(result.createdAt).toLocaleString(),
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ExamResults");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(data, "ExamScores.xlsx");
    } catch (error) {
      console.error("Error exporting exam scores:", error);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const usersSheet = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");
    const coursesSheet = XLSX.utils.json_to_sheet(courses);
    XLSX.utils.book_append_sheet(workbook, coursesSheet, "Courses");
    const purchasedSheet = XLSX.utils.json_to_sheet(coursePurchasedData);
    XLSX.utils.book_append_sheet(workbook, purchasedSheet, "Purchases");
    const forumSheet = XLSX.utils.json_to_sheet(forumData);
    XLSX.utils.book_append_sheet(workbook, forumSheet, "Forum");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "DashboardData.xlsx");
  };

  const chartData = [
    { name: t("customers"), value: userData.length },
    { name: t("membersPurchased"), value: coursePurchasedData.length },
    { name: t("courses"), value: courses.length },
    { name: t("forumPosts"), value: forumData.length },
  ];

  return (
    <div className="container-fluid px-3 px-md-4 mt-4">
      {/* Chart Section for Mobile - Displayed at the top on mobile */}
      <Card className="p-3 mb-4 shadow-sm d-md-none">
        <h4 className="text-center mb-3 fs-5">{t("statisticsOverview")}</h4>
        <div style={{ width: "100%", height: "280px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                height={40}
                angle={-45}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Legend
                wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                verticalAlign="top"
                height={30}
              />
              <Bar dataKey="value" fill="#8884d8" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center p-3 shadow-sm h-100">
            <FaUsers size={30} className="text-primary mb-2" />
            <h5 className="fs-6">{t("totalCustomers")}</h5>
            <h3 className="fs-4">{userData.length.toLocaleString()}</h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center p-3 shadow-sm h-100">
            <FaUserCheck size={30} className="text-success mb-2" />
            <h5 className="fs-6">{t("membersPurchased")}</h5>
            <h3 className="fs-4">
              {coursePurchasedData.length.toLocaleString()}
            </h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center p-3 shadow-sm h-100">
            <FaBook size={30} className="text-warning mb-2" />
            <h5 className="fs-6">{t("courses")}</h5>
            <h3 className="fs-4">{courses.length.toLocaleString()}</h3>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="text-center p-3 shadow-sm h-100">
            <FaComments size={30} className="text-info mb-2" />
            <h5 className="fs-6">{t("forumPosts")}</h5>
            <h3 className="fs-4">{forumData.length.toLocaleString()}</h3>
          </Card>
        </Col>
      </Row>

      {/* Export Buttons */}
      <Row className="mb-3">
        <Col xs={12} sm={6} className="mb-2 mb-sm-0">
          <Button variant="success" onClick={exportToExcel} className="w-100">
            <FaFileExport className="me-2" />
            {t("exportToExcel")}
          </Button>
        </Col>
        <Col xs={12} sm={6}>
          <Button
            variant="primary"
            onClick={exportExamScoreToExcel}
            className="w-100"
          >
            <FaFileExport className="me-2" />
            Export Exam Scores
          </Button>
        </Col>
      </Row>

      {/* Chart Section for Desktop */}
      <Card className="p-3 p-md-4 shadow-sm d-none d-md-block">
        <h4 className="text-center mb-3 fs-5 fs-md-4">
          {t("statisticsOverview")}
        </h4>
        <div style={{ width: "100%", height: "300px", minHeight: "250px" }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" barSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashBoardTotal;
