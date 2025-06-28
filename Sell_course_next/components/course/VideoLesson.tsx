"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { AspectRatio } from "../ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import {
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
} from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

import { VideoState } from "@/app/types/Course/Lesson/content/video";

// Định nghĩa interface cho mỗi từ trong script theo định dạng mới
interface WordItem {
  word: string;
  start: string;
  end: string;
  confidence: string;
}

// Định nghĩa interface cho script response từ API
interface ScriptResponse {
  metadata: {
    transaction_key: string;
    request_id: string;
    sha256: string;
    created: string;
    duration: number;
    channels: number;
    models: string[];
    model_info: Record<string, unknown>;
  };
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words: WordItem[];
      }>;
    }>;
  };
}

// Định nghĩa interface cho mỗi mục trong transcript theo định dạng yêu cầu
interface TranscriptItem {
  transcript: string;
  words: WordItem[];
}

// Định nghĩa interface cho mỗi mục trong discussion (nếu bạn muốn giữ phần này)
interface DiscussionItem {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  replies?: DiscussionItem[];
}

// Updated props interface to match your structure
interface VideoLessonProps extends VideoState {
  onComplete?: (contentId: string) => void;
  videoData: VideoState;
}

export function VideoLesson({ videoData }: VideoLessonProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [playerRef, setPlayerRef] = useState<ReactPlayer | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  // State cho transcript
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] =
    useState<number>(-1);
  const [showTranscript, setShowTranscript] = useState(false);

  // State cho discussions (khởi tạo rỗng, nếu cần fetch thì thêm logic fetch)
  const [discussions] = useState<DiscussionItem[]>([]);

  // Refs cho auto-scroll transcript
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeTranscriptRef = useRef<HTMLDivElement>(null);

  // Hàm xử lý dữ liệu script từ API thành format 10s mỗi dòng
  const processScriptData = (
    scriptData: ScriptResponse[]
  ): TranscriptItem[] => {
    if (!scriptData || scriptData.length === 0) return [];

    // Lấy danh sách words từ response đầu tiên
    const words =
      scriptData[0]?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
    if (words.length === 0) return [];

    const processedTranscript: TranscriptItem[] = [];
    const SEGMENT_DURATION = 10; // 10 giây mỗi segment

    // Convert string times to numbers for processing
    const wordsWithNumericTimes = words.map((word) => ({
      ...word,
      startNum: parseFloat(word.start),
      endNum: parseFloat(word.end),
    }));

    // Tìm thời gian bắt đầu và kết thúc
    const startTime = wordsWithNumericTimes[0].startNum;
    const endTime =
      wordsWithNumericTimes[wordsWithNumericTimes.length - 1].endNum;

    // Chia thành các segment 10 giây
    for (
      let segmentStart = Math.floor(startTime);
      segmentStart < endTime;
      segmentStart += SEGMENT_DURATION
    ) {
      const segmentEnd = segmentStart + SEGMENT_DURATION;

      // Lọc các từ thuộc segment này
      const segmentWords = wordsWithNumericTimes.filter(
        (word) => word.startNum >= segmentStart && word.startNum < segmentEnd
      );

      if (segmentWords.length > 0) {
        // Tạo text từ các từ trong segment
        const segmentText = segmentWords.map((word) => word.word).join(" ");

        // Convert back to original format (strings)
        const originalFormatWords: WordItem[] = segmentWords.map((word) => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence,
        }));

        processedTranscript.push({
          transcript: segmentText,
          words: originalFormatWords,
        });
      }
    }

    return processedTranscript;
  };

  // Fetch video data on component mount
  useEffect(() => {
    const fetchVideoAndTranscriptData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (videoData?.urlScript) {
          try {
            const scriptResponse = await fetch(videoData.urlScript);
            if (!scriptResponse.ok) {
              throw new Error(`HTTP error! status: ${scriptResponse.status}`);
            }
            const scriptData: ScriptResponse[] = await scriptResponse.json();

            // Xử lý dữ liệu script thành format 10s mỗi dòng
            const processedTranscript = processScriptData(scriptData);
            setTranscript(processedTranscript);
          } catch (scriptErr) {
            console.error("Error fetching transcript:", scriptErr);
            // Optionally set a specific error for transcript
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
        console.error("Error fetching video:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAndTranscriptData();
  }, [videoData.urlScript]);

  // Tự động ẩn controls sau 3 giây không hoạt động
  useEffect(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (showControls && playing) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, playing]);

  // Tìm transcript hiện tại dựa trên thời gian phát
  useEffect(() => {
    if (transcript.length > 0 && playedSeconds > 0) {
      const newCurrentIndex = transcript.findIndex((item) => {
        const itemStartTime = parseFloat(item.words[0]?.start || "0");
        const itemEndTime = parseFloat(
          item.words[item.words.length - 1]?.end || "0"
        );
        return playedSeconds >= itemStartTime && playedSeconds < itemEndTime;
      });

      if (
        newCurrentIndex !== -1 &&
        newCurrentIndex !== currentTranscriptIndex
      ) {
        setCurrentTranscriptIndex(newCurrentIndex);
      }
    }
  }, [playedSeconds, transcript, currentTranscriptIndex]);

  // Auto-scroll to active transcript when currentTranscriptIndex changes
  useEffect(() => {
    if (
      currentTranscriptIndex !== -1 &&
      activeTranscriptRef.current &&
      transcriptContainerRef.current
    ) {
      activeTranscriptRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTranscriptIndex]);

  // Player event handlers
  const handlePlayPause = () => {
    setPlaying(!playing);
    setShowControls(true);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setMuted(value[0] === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    if (playerRef) {
      playerRef.seekTo(value[0]);
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSkipBackward = () => {
    if (playerRef) {
      const newTime = Math.max(0, playedSeconds - 10);
      playerRef.seekTo(newTime);
    }
  };

  const handleSkipForward = () => {
    if (playerRef) {
      const newTime = Math.min(duration, playedSeconds + 10);
      playerRef.seekTo(newTime);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  // Hàm định dạng thời gian từ giây sang mm:ss hoặc hh:mm:ss
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Xử lý khi click vào một dòng transcript
  const handleTranscriptClick = (item: TranscriptItem) => {
    if (playerRef && item.words.length > 0) {
      const startTimeInSeconds = parseFloat(item.words[0].start);
      playerRef.seekTo(startTimeInSeconds);
      setPlaying(true); // Tự động phát video khi click vào transcript
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            {videoData?.contents.contentType}
          </h2>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Loading video...</span>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            {videoData?.contents.contentName}
          </h2>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="w-8 h-8" />
              <span>Error loading video</span>
              <span className="text-sm text-muted-foreground">{error}</span>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Video Player Container */}
      <div className="flex gap-4">
        {/* Main Video Player */}
        <div
          className={`${
            showTranscript ? "w-2/3" : "w-full"
          } transition-all duration-300`}
        >
          <AspectRatio ratio={16 / 9}>
            <div
              className="relative w-full h-full bg-black rounded-lg overflow-hidden group"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => playing && setShowControls(false)}
            >
              {videoData?.url ? (
                <>
                  <ReactPlayer
                    ref={setPlayerRef}
                    url={videoData.url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={() => setPlaying(false)}
                    config={{
                      file: {
                        attributes: {
                          crossOrigin: "anonymous",
                        },
                        forceHLS: true, // Force HLS for M3U8 files
                      },
                    }}
                  />

                  {/* Custom Controls Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                      showControls ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Play/Pause Button (Center) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={handlePlayPause}
                      >
                        {playing ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Play className="w-8 h-8 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <Slider
                          value={[played]}
                          onValueChange={handleSeekChange}
                          onValueCommit={handleSeekMouseUp}
                          onPointerDown={handleSeekMouseDown}
                          max={1}
                          step={0.001}
                          className="w-full"
                        />
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handlePlayPause}
                          >
                            {playing ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleSkipBackward}
                          >
                            <SkipBack className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleSkipForward}
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleToggleMute}
                          >
                            {muted ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </Button>

                          <div className="w-20">
                            <Slider
                              value={[muted ? 0 : volume]}
                              onValueChange={handleVolumeChange}
                              max={1}
                              step={0.01}
                              className="w-full"
                            />
                          </div>

                          <span className="text-white text-sm font-mono">
                            {formatTime(playedSeconds)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => setShowTranscript(!showTranscript)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-8 h-8" />
                    <span>No video URL available</span>
                  </div>
                </div>
              )}
            </div>
          </AspectRatio>
        </div>

        {/* Transcript Sidebar */}
        {showTranscript && (
          <div className="w-1/3">
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <ScrollArea
                  className="h-[400px] w-full rounded-md border p-4"
                  ref={transcriptContainerRef}
                >
                  {transcript.length > 0 ? (
                    <div className="space-y-2">
                      {transcript.map((item, index) => (
                        <div
                          key={index}
                          ref={
                            index === currentTranscriptIndex
                              ? activeTranscriptRef
                              : null
                          }
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            index === currentTranscriptIndex
                              ? "bg-primary/20 border-primary border"
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                          onClick={() => handleTranscriptClick(item)}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground font-mono min-w-[60px]">
                              {item.words.length > 0
                                ? formatTime(parseFloat(item.words[0].start))
                                : "00:00"}
                            </span>
                            <p className="text-sm leading-relaxed flex-1">
                              {item.transcript}
                            </p>
                          </div>

                          {/* Hiển thị thông tin về segment */}
                          <div className="mt-2 text-xs text-muted-foreground">
                            Duration: ~10s | Words: {item.words.length}
                            {item.words.length > 0 && (
                              <span className="ml-2">
                                End:{" "}
                                {formatTime(
                                  parseFloat(
                                    item.words[item.words.length - 1].end
                                  )
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No transcript available</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="discussion" className="mt-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {discussions.length > 0 ? (
                    <div className="space-y-4">
                      {discussions.map((discussion) => (
                        <div
                          key={discussion.id}
                          className="p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold">
                                {discussion.user.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">
                                  {discussion.user}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {discussion.timestamp}
                                </span>
                              </div>
                              <p className="text-sm">{discussion.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No discussions yet</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
