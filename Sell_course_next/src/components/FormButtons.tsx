import React from "react";
import { FormButtonsProps } from "@/app/type/category/CategoryFormTypes";

export const FormButtons: React.FC<FormButtonsProps> = ({
  loading,
  onCancel,
  submitText,
  cancelText,
  loadingText,
}) => {
  return (
    <div className="form-buttons">
      <button type="button" onClick={onCancel} className="btn btn-cancel">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4L4 10M4 10L10 16M4 10H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {cancelText}
      </button>
      <button type="submit" disabled={loading} className="btn btn-submit">
        {loading ? (
          <>
            <svg
              className="animate-spin"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {loadingText}
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10L8 14L16 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {submitText}
          </>
        )}
      </button>
    </div>
  );
};
