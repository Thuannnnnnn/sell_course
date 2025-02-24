"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getVideo } from "@/app/api/video/video";
import { useSession } from "next-auth/react";
import { VideoResponse } from "@/app/type/video/video";

interface VideoLessonProps {
  title: string;
  contentId: string;
  duration: string;
  onComplete: () => void;
}

interface SubtitleSegment {
  segment: string;
  start: number;
  end: number;
  text: string;
}

export default function VideoLesson({
  title,
  contentId,
  duration,
}: VideoLessonProps) {
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (!session?.user.token || !contentId) return;
        const data = await getVideo(contentId, session.user.token);
        setVideoData(data);

        // Fetch subtitle script
        if (data.urlScript) {
          const subtitleResponse = await fetch(data.urlScript);
          const subtitleData: SubtitleSegment[] = await subtitleResponse.json();
          setSubtitles(subtitleData);
        }
      } catch (err) {
        setError("Failed to fetch video");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [contentId, session]);

  useEffect(() => {
    if (videoData?.url && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        if (!hlsRef.current) {
          hlsRef.current = new Hls();
          hlsRef.current.loadSource(videoData.url);
          hlsRef.current.attachMedia(video);
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
          });
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoData.url;
        video.addEventListener("canplay", () => video.play());
      }
      const updateSubtitle = () => {
        const currentTime = video.currentTime;
        const matchingSubtitle = subtitles.find(
          (subtitle) =>
            currentTime >= subtitle.start && currentTime <= subtitle.end
        );

        if (matchingSubtitle) {
          setCurrentText(matchingSubtitle.text);
        } else {
          setCurrentText(null);
        }
      };

      video.addEventListener("timeupdate", updateSubtitle);

      return () => {
        video.removeEventListener("timeupdate", updateSubtitle);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoData?.url, subtitles]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="lesson-container">
      <h2>{title}</h2>
      <div
        className="video-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <video ref={videoRef} controls width="800px"></video>
        {currentText && (
          <div
            className="subtitle-box"
            style={{
              marginTop: "10px",
              padding: "10px",
              fontSize: "18px",
              backgroundColor: "yellow",
              borderRadius: "5px",
              textAlign: "center",
              width: "80%",
            }}
          >
            {currentText}
          </div>
        )}
      </div>
      <p>Duration: {duration}</p>
    </div>
  );
}
