import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import gifBean from "../../public/animation/BeanEater.gif";
import "@/style/PageLoader.css";
import Image from "next/image";

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
      <Image
        src={typeof gif === "string" ? gif : gif.src}
        alt="Loading..."
        className="loadingGif "
        width={300}
        height={300}
      />
    </div>
  );
};

export default PageLoader;
