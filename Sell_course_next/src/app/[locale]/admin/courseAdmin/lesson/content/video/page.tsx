'use client';
import { useSearchParams } from 'next/navigation';

const VideoPage = () => {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('contentId');

  return <div>Video Page for content ID: {contentId}</div>;
};

export default VideoPage;
