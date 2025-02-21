"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import CourseInfo from "@/components/course/courseInfo";

export default function CourseInfoPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <CourseInfo />
  );
}
