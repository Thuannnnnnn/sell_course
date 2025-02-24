"use client";

import { useState } from "react";
import styles from "@/style/Script.module.css";

export default function EditScriptPage() {
  const [jsonData, setJsonData] = useState<{ start: string; end: string; text: string; edited?: boolean }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target?.result as string).map((item: any) => ({ ...item, edited: false }));
          setJsonData(parsedData);
        } catch (error) {
          console.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const updatedData = [...jsonData];
    updatedData[index].text = value;
    updatedData[index].edited = true;
    setJsonData(updatedData);
  };

  const handleFocus = (index: number) => {
    setEditingIndex(index);
  };

  const handleBlur = () => {
    setEditingIndex(null);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 4)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>JSON Editor</h2>
      <input type="file" accept="application/json" onChange={handleFileUpload} className={styles.fileInput} />
      
      <div className={styles.jsonContainer}>
        {jsonData.map((item, index) => (
          <div key={index} className={`${styles.jsonItem} ${editingIndex === index ? styles.editing : ""}`}>
            {item.edited && <span className={styles.editLabel}>Chỉnh sửa</span>}
            <div className={styles.jsonTime}>
              Start: {item.start} | End: {item.end}
            </div>
            <textarea
              value={item.text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              className={styles.textArea}
            />
          </div>
        ))}
      </div>

      <button onClick={downloadJSON} className={styles.button}>
        Download JSON
      </button>
    </div>
  );
}
