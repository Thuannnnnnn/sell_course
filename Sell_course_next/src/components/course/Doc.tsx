import React from "react";
import { FaFileAlt } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "../../style/CourseInfo.css";

const DocSection = ({ section, index, expandedSection, toggleSection, handleItemClick, completedItems, selectedItem }) => {
  return (
    <div className={`section ${expandedSection === index ? "active" : ""}`}>
      <div className="section-header" onClick={() => toggleSection(index)}>
        <h4><FaFileAlt size={16} /> {section.title}</h4>
        {expandedSection === index ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
      </div>
      {expandedSection === index && (
              <div className="item-list">
                {section.items.map((item, idx) => {
                  const key = `${index}-${idx}`;
                  return (
                    <div key={idx} className={`item ${selectedItem === item ? "selected" : ""} ${completedItems[key] ? "completed" : ""}`} onClick={() => handleItemClick(index, idx)}>
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

export { DocSection };