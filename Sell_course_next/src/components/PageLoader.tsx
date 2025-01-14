import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import gifBean from "../app/image/animation/BeanEater.gif";
import "@/style/PageLoader.css";

interface PageLoaderProps {
  rediecrectPath: string;
  delay?: number;
  gif?: string | { src: string };
}

const PageLoader: React.FC<PageLoaderProps> = ({
  rediecrectPath,
  delay = 2000,
  gif = gifBean,
}) => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(rediecrectPath);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [rediecrectPath, delay, router]);

  return (
    <div className="pageLoader">
      <img
        src={typeof gif === "string" ? gif : gif.src}
        alt="Loading..."
        className="loadingGif "
      />
    </div>
  );
};

export default PageLoader;
