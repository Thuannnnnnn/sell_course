"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { AspectRatio } from "../ui/aspect-ratio";
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
  Newspaper,
  Maximize,
  Minimize,
  CheckCircle,
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

// Updated props interface to match your structure
interface VideoLessonProps extends VideoState {
  onComplete?: (contentId: string) => void;
  videoData: VideoState;
  isCompleted?: boolean;
}

export function VideoLesson({
  videoData,
  onComplete,
  isCompleted = false,
}: VideoLessonProps) {
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // State cho transcript
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] =
    useState<number>(-1);
  const [showTranscript, setShowTranscript] = useState(false);

  // State cho auto-complete
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);

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

  // Tìm transcript hiện tại dựa trên thời gian phát - chỉ tracking segment, không tracking từng từ
  useEffect(() => {
    if (transcript.length > 0 && playedSeconds >= 0) {
      // Tìm transcript index chính xác dựa trên thời gian hiện tại
      let newCurrentIndex = -1;
      
      for (let i = 0; i < transcript.length; i++) {
        const item = transcript[i];
        if (item.words.length > 0) {
          const itemStartTime = parseFloat(item.words[0].start || "0");
          const itemEndTime = parseFloat(
            item.words[item.words.length - 1].end || "0"
          );
          
          // Kiểm tra nếu thời gian hiện tại nằm trong khoảng của transcript này
          if (playedSeconds >= itemStartTime && playedSeconds <= itemEndTime + 0.5) {
            newCurrentIndex = i;
            break;
          }
          
          // Hoặc nếu thời gian hiện tại gần với transcript này nhất (tolerance 1 giây)
          if (playedSeconds >= itemStartTime - 0.5 && playedSeconds < itemStartTime) {
            newCurrentIndex = i;
            break;
          }
        }
      }

      // Cập nhật index nếu có thay đổi
      if (newCurrentIndex !== currentTranscriptIndex) {
        setCurrentTranscriptIndex(newCurrentIndex);
      }
    }
  }, [playedSeconds, transcript, currentTranscriptIndex]);

  // Auto-complete logic: Đánh dấu hoàn thành khi xem được 2/3 video
  useEffect(() => {
    if (duration > 0 && playedSeconds > 0 && !autoCompleted && !isCompleted) {
      const percentage = (playedSeconds / duration) * 100;
      setWatchedPercentage(percentage);

      // Nếu đã xem được 2/3 video (66.67%) thì tự động đánh dấu hoàn thành
      if (percentage >= 66.67) {
        console.log(
          "🎯 Video auto-complete triggered at:",
          percentage.toFixed(2) + "%"
        );
        setAutoCompleted(true);

        // Gọi callback onComplete nếu có
        if (onComplete && videoData?.videoId) {
          onComplete(videoData.videoId);
        }
      }
    }
  }, [
    playedSeconds,
    duration,
    autoCompleted,
    isCompleted,
    onComplete,
    videoData?.videoId,
  ]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-scroll to active transcript when currentTranscriptIndex changes - cải thiện smooth scroll
  useEffect(() => {
    if (
      currentTranscriptIndex !== -1 &&
      activeTranscriptRef.current &&
      transcriptContainerRef.current
    ) {
      // Smooth scroll với timing tốt hơn
      setTimeout(() => {
        activeTranscriptRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest"
        });
      }, 100);
    }
  }, [currentTranscriptIndex]);

  // Auto-show transcript khi video bắt đầu phát và có transcript
  useEffect(() => {
    if (playing && transcript.length > 0 && !showTranscript) {
      setShowTranscript(true);
    }
  }, [playing, transcript.length, showTranscript]);

  // Tự động bật transcript khi vào fullscreen nếu có transcript
  useEffect(() => {
    if (isFullscreen && transcript.length > 0) {
      setShowTranscript(true);
    }
  }, [isFullscreen, transcript.length]);

  // Player event handlers
  const handlePlayPause = () => {
    setPlaying(!playing);
    setShowControls(true);
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
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

  // Hàm render transcript với text thông thường (không highlight từng từ)
  const renderTranscriptText = (item: TranscriptItem) => {
    return (
      <p className="text-sm leading-relaxed flex-1">
        {item.transcript}
      </p>
    );
  };

  // Xử lý khi click vào một dòng transcript
  const handleTranscriptClick = (item: TranscriptItem) => {
    if (playerRef && item.words.length > 0) {
      const startTimeInSeconds = parseFloat(item.words[0].start);
      playerRef.seekTo(startTimeInSeconds);
      setPlaying(true);
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
      {/* Progress and Completion Indicator */}
      {duration > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progress:</span>
              <span className="text-sm text-muted-foreground">
                {watchedPercentage.toFixed(1)}%
              </span>
            </div>
            {(autoCompleted || isCompleted) && (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                watchedPercentage >= 66.67 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(watchedPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="font-medium">66.7% for completion</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div 
        ref={videoContainerRef}
        className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'flex gap-4'}`}
      >
        {/* Main Video Player */}
        <div
          className={`${
            isFullscreen 
              ? "flex-1" 
              : showTranscript 
                ? "w-2/3" 
                : "w-full"
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
                        forceHLS: true,
                      },
                    }}
                  />

                  {/* Subtitle/Script overlay for fullscreen mode */}
                  {isFullscreen && showTranscript && currentTranscriptIndex >= 0 && transcript[currentTranscriptIndex] && (
                    <div className="absolute bottom-16 left-4 right-4 flex justify-center pointer-events-none">
                      <div className="bg-black/80 text-white px-6 py-3 rounded-lg max-w-4xl text-center">
                        <p className="text-lg leading-relaxed">
                          {transcript[currentTranscriptIndex].transcript}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Custom Controls Overlay */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      showControls ? "opacity-100" : "opacity-0"
                    } z-40 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Play/Pause Button (Center) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        className="pointer-events-auto p-4 rounded-full hover:bg-black/20 transition-all duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Center play/pause clicked!');
                          handlePlayPause();
                        }}
                      >
                        {playing ? (
                          <Pause className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                          <Play className="w-12 h-12 ml-1 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
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
                      <div className="flex items-center justify-between z-50">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Bottom play/pause clicked!');
                              handlePlayPause();
                            }}
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
                            className="text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Skip backward clicked!');
                              handleSkipBackward();
                            }}
                          >
                            <SkipBack className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Skip forward clicked!');
                              handleSkipForward();
                            }}
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Mute toggle clicked!');
                              handleToggleMute();
                            }}
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
                            className={`text-white hover:bg-white/20 z-50 ${
                              showTranscript ? 'bg-white/20' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Transcript toggle clicked!');
                              setShowTranscript(!showTranscript);
                            }}
                            title={
                              isFullscreen 
                                ? (showTranscript ? "Hide Subtitles" : "Show Subtitles")
                                : (showTranscript ? "Hide Transcript" : "Show Transcript")
                            }
                          >
                            <Newspaper className="w-4 h-4" />
                            {transcript.length > 0 && (
                              <span className="ml-1 text-xs">
                                {isFullscreen ? 'SUB' : `(${transcript.length})`}
                              </span>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 z-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Fullscreen toggle clicked!');
                              handleFullscreen();
                            }}
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                          >
                            {isFullscreen ? (
                              <Minimize className="w-4 h-4" />
                            ) : (
                              <Maximize className="w-4 h-4" />
                            )}
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

        {/* Fullscreen Subtitle Panel */}
        {isFullscreen && showTranscript && (
          <div className="bg-black/90 text-white p-4 border-t border-gray-700">
            <div className="max-w-6xl mx-auto">
              {/* Current transcript display */}
              {currentTranscriptIndex >= 0 && transcript[currentTranscriptIndex] && (
                <div className="mb-4">
                  <div className="text-center">
                    <p className="text-xl leading-relaxed mb-2 text-white">
                      {transcript[currentTranscriptIndex].transcript}
                    </p>
                    <div className="text-sm text-gray-400">
                      Segment {currentTranscriptIndex + 1} of {transcript.length} | 
                      Time: {transcript[currentTranscriptIndex].words.length > 0 
                        ? formatTime(parseFloat(transcript[currentTranscriptIndex].words[0].start))
                        : "00:00"
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Progress bar */}
              {transcript.length > 0 && (
                <div className="mb-3">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${currentTranscriptIndex >= 0 ? ((currentTranscriptIndex + 1) / transcript.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Start</span>
                    <span>{currentTranscriptIndex >= 0 ? `${currentTranscriptIndex + 1}/${transcript.length}` : '0/0'}</span>
                    <span>End</span>
                  </div>
                </div>
              )}

              {/* Quick navigation */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    if (currentTranscriptIndex > 0) {
                      const prevItem = transcript[currentTranscriptIndex - 1];
                      handleTranscriptClick(prevItem);
                    }
                  }}
                  disabled={currentTranscriptIndex <= 0}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm rounded transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    if (currentTranscriptIndex < transcript.length - 1) {
                      const nextItem = transcript[currentTranscriptIndex + 1];
                      handleTranscriptClick(nextItem);
                    }
                  }}
                  disabled={currentTranscriptIndex >= transcript.length - 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm rounded transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transcript Sidebar - Only show when not in fullscreen */}
        {showTranscript && !isFullscreen && (
          <div className="w-1/3">
            <div className="w-full">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Transcript</h3>
                  {currentTranscriptIndex >= 0 && transcript.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {currentTranscriptIndex + 1} / {transcript.length}
                    </div>
                  )}
                </div>
                {transcript.length > 0 && currentTranscriptIndex >= 0 && (
                  <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((currentTranscriptIndex + 1) / transcript.length) * 100}%` 
                      }}
                    />
                  </div>
                )}
              </div>

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
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 transform ${
                          index === currentTranscriptIndex
                            ? 'bg-primary/20 border-primary scale-105 border shadow-lg'
                            : 'bg-muted/50 hover:bg-muted hover:scale-102'
                        }`}
                        onClick={() => handleTranscriptClick(item)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground font-mono min-w-[60px]">
                            {item.words.length > 0
                              ? formatTime(parseFloat(item.words[0].start))
                              : "00:00"}
                          </span>
                          {renderTranscriptText(item)}
                        </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
