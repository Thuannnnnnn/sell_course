import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageLoaderProps {
  rediecrectPath: string;
  delay?: number;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  rediecrectPath,
  delay = 2000,
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
    <div>
      <p>Loading...</p>
    </div>
  );
};

export default PageLoader;
