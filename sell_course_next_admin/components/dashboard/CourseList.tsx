"use client";
import React from "react";
import { Eye, Edit, Archive } from "lucide-react";
export function CourseList() {
  const courses = [
    {
      id: 1,
      title: "React Fundamentals",
      students: 234,
      revenue: "$12,400",
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhY3QlMjBqc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      students: 186,
      revenue: "$9,200",
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amF2YXNjcmlwdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      students: 129,
      revenue: "$6,450",
      status: "Draft",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dWklMjB1eHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 4,
      title: "Node.js Backend Development",
      students: 94,
      revenue: "$4,700",
      status: "Published",
      image:
        "https://images.unsplash.com/photo-1648737963540-306235c8170e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm9kZWpzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
  ];
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Courses</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Add New Course
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground text-xs font-medium border-b border-border">
              <th className="p-4 whitespace-nowrap">Course</th>
              <th className="p-4 whitespace-nowrap">Students</th>
              <th className="p-4 whitespace-nowrap">Revenue</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-muted/50">
                <td className="p-4">
                  <div className="flex items-center">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-10 h-10 rounded object-cover mr-3"
                    />
                    <span className="font-medium">{course.title}</span>
                  </div>
                </td>
                <td className="p-4">{course.students}</td>
                <td className="p-4">{course.revenue}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.status === "Published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
