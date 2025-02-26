"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getVideo } from "@/app/api/video/video";
import { useSession } from "next-auth/react";
import { VideoResponse } from "@/app/type/video/video";

interface VideoLessonProps {
  title: string;
  contentId: string;
  lessonId: string;
  onComplete: (contentId: string, lessonId: string) => void;
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
  lessonId,
  onComplete,
}: VideoLessonProps) {
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (!session?.user.token || !contentId) return;
        const data = await getVideo(contentId, session.user.token);
        setVideoData(data);

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
        setCurrentText(matchingSubtitle?.text || null);
      };

      const handleMetadataLoaded = () => {
        if (videoRef.current) {
          setVideoDuration(videoRef.current.duration);
        }
      };

      const handleTimeUpdate = () => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const targetTime = videoDuration * 0.8;
          if (!hasCompleted && currentTime >= targetTime) {
            onComplete(contentId, lessonId);
            setHasCompleted(true);
          }
        }
      };

      video.addEventListener("timeupdate", updateSubtitle);
      video.addEventListener("loadedmetadata", handleMetadataLoaded);
      video.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        video.removeEventListener("timeupdate", updateSubtitle);
        video.removeEventListener("loadedmetadata", handleMetadataLoaded);
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [
    videoData?.url,
    subtitles,
    videoDuration,
    hasCompleted,
    contentId,
    lessonId,
    onComplete,
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="lesson-container" style={{ width: "100%", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>{title}</h2>
      <div
        className="video-container"
        style={{
          width: "100%",
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          controls
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
        {currentText && (
          <div
            className="subtitle-box"
            style={{
              position: "absolute",
              bottom: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "18px",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {currentText}
          </div>
        )}
      </div>
      <div
        className="script-section"
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "5px",
          fontSize: "16px",
          color: "#000",
        }}
      >
        <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Script</h3>
        <p>Script content will be displayed here...</p>
      </div>
      <p style={{ textAlign: "center", marginTop: "10px", color: "#666" }}>
        Thời lượng Video: {videoDuration.toFixed(2)}s
      </p>
    </div>
  );
}