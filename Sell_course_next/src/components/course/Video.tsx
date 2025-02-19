import React, { useState } from "react";
import { FaCheckCircle, FaPlayCircle,FaVideo } from "react-icons/fa";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "../../style/CourseInfo.css";

const VideoSection = ({ section, index, expandedSection, toggleSection, handleItemClick, completedItems, selectedItem }) => {
  return (
    <div className={`section ${expandedSection === index ? "active" : ""}`}>
      <div className="section-header" onClick={() => toggleSection(index)}>
      <h4>
  <FaVideo size={18} style={{ marginRight: "8px" }} />
  {section.title}
</h4>
        {expandedSection === index ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
      </div>
      {expandedSection === index && (
        <div className="item-list">
          {section.items.map((item, idx) => {
            const key = `${index}-${idx}`;
            return (
              <div key={idx} className={`item ${selectedItem === item ? "selected" : ""} ${completedItems[key] ? "completed" : ""}`} onClick={() => handleItemClick(index, idx, item.videoUrl)}>
                <FaPlayCircle size={16} className="video-icon" />
                <span className="item-name">{item.name}</span>
                {completedItems[key] ? <FaCheckCircle size={16} color="green" /> : <span>{item.duration}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { VideoSection };
