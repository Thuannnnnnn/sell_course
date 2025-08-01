// components/layout/PageHead.tsx
"use client";

import { useEffect } from "react";

interface PageHeadProps {
  title: string;
  description?: string;
}

const PageHead: React.FC<PageHeadProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
};

export default PageHead;
