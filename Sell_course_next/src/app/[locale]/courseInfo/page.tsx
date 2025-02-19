"use client";

import React, { useState } from "react";
import CourseInfoBanner from "@/components/course/courseInfo";
import { VideoSection } from "@/components/course/Video";
import { DocSection } from "@/components/course/Doc";
import { QuizSection } from "@/components/course/Quiz";
import { ExamSection } from "@/components/course/Exam";
import "../../../style/CourseInfo.css";

const ContentDisplay = ({ selectedItem }) => {
  return (
    <div className="content-container">
      <div className="content-display">
        {selectedItem ? (
          <div className="video-fullscreen">
            <h3>Now Viewing: {selectedItem.name}</h3>
            {selectedItem.videoUrl && (
              <video className="fullscreen-video" controls autoPlay>
                <source src={selectedItem.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : (
          <div className="placeholder">Select an item to view</div>
        )}
      </div>
    </div>
  );
};

const CourseInfo = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [completedItems, setCompletedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [progress, setProgress] = useState("0%");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const course = {
    title: "Course Information ",
    sections: [
      { type: "video", title: "Intro to Course and History", items: [ { name: "Course Info", duration: "5:36", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }, { name: "Greetings and Introduction", duration: "7:20", videoUrl: "https://www.w3schools.com/html/movie.mp4" } ] },
      { type: "doc", title: "Documentation", items: [ { name: "Course Documentation", duration: "8:45" }, { name: "Reading Materials", duration: "6:30" } ] },
      { type: "quiz", title: "Quiz", items: [ { name: "Module 1 Quiz", duration: "15:00" }, { name: "Module 2 Quiz", duration: "10:00" } ] },
      { type: "exam", title: "Final Exam", items: [ { name: "Final Exam", duration: "30:00" } ] },
    ],
  };

  const calculateProgress = (updatedItems) => {
    const totalItems = course.sections.reduce((sum, section) => sum + section.items.length, 0);
    const completedCount = Object.keys(updatedItems).length;
    setProgress(`${Math.round((completedCount / totalItems) * 100)}%`);
  };

  const handleItemClick = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setCompletedItems((prev) => {
      const updatedItems = { ...prev, [key]: true };
      calculateProgress(updatedItems);
      return updatedItems;
    });
    setSelectedItem(course.sections[sectionIndex].items[itemIndex]);
    setCurrentSectionIndex(sectionIndex);
    setCurrentItemIndex(itemIndex);
  };

  const handleNext = () => {
    if (currentItemIndex < course.sections[currentSectionIndex].items.length - 1) {
      handleItemClick(currentSectionIndex, currentItemIndex + 1);
    } else if (currentSectionIndex < course.sections.length - 1) {
      handleItemClick(currentSectionIndex + 1, 0);
    }
  };

  const handleBack = () => {
    if (currentItemIndex > 0) {
      handleItemClick(currentSectionIndex, currentItemIndex - 1);
    } else if (currentSectionIndex > 0) {
      handleItemClick(currentSectionIndex - 1, course.sections[currentSectionIndex - 1].items.length - 1);
    }
  };

  return (
    <div className="course-container">
      <CourseInfoBanner title="Course Information" subtitle={course.title} />
      <div className="progress-container">
        <p className="progress">Your Progress: {progress}</p>
      </div>
      <div className="course-wrapper">
        <div className="course-info">
          <div className="course-content">
            <h3>Course Content</h3>
            {course.sections.map((section, index) => {
              switch (section.type) {
                case "video":
                  return <VideoSection key={index} section={section} index={index} expandedSection={expandedSection} toggleSection={setExpandedSection} handleItemClick={handleItemClick} completedItems={completedItems} selectedItem={selectedItem} />;
                case "doc":
                  return <DocSection key={index} section={section} index={index} expandedSection={expandedSection} toggleSection={setExpandedSection} handleItemClick={handleItemClick} completedItems={completedItems} selectedItem={selectedItem} />;
                case "quiz":
                  return <QuizSection key={index} section={section} index={index} expandedSection={expandedSection} toggleSection={setExpandedSection} handleItemClick={handleItemClick} completedItems={completedItems} selectedItem={selectedItem} />;
                case "exam":
                  return <ExamSection key={index} section={section} index={index} expandedSection={expandedSection} toggleSection={setExpandedSection} handleItemClick={handleItemClick} completedItems={completedItems} selectedItem={selectedItem} />;
                default:
                  return null;
              }
            })}
          </div>
          <ContentDisplay selectedItem={selectedItem} />
        </div>
        <div className="navigation-buttons">
          <button onClick={handleBack} disabled={currentSectionIndex === 0 && currentItemIndex === 0}>Back</button>
          <button onClick={handleNext} disabled={currentSectionIndex === course.sections.length - 1 && currentItemIndex === course.sections[currentSectionIndex].items.length - 1}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default CourseInfo;
