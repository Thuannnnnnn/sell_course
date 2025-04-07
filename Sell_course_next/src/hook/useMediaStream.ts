import { useState, useEffect, useCallback } from "react";

interface UseMediaStreamOptions {
  audio?: boolean;
  video?: boolean;
}

interface UseMediaStreamReturn {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  toggleCamera: (enabled: boolean) => void;
  toggleMicrophone: (enabled: boolean) => void;
  startScreenShare: () => Promise<MediaStream | null>;
  stopScreenShare: () => void;
  stopStream: () => void;
}

export const useMediaStream = (
  options: UseMediaStreamOptions = { audio: true, video: true }
): UseMediaStreamReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCamera, setHasCamera] = useState<boolean>(!!options.video);
  const [hasMicrophone, setHasMicrophone] = useState<boolean>(!!options.audio);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  }, [screenStream]);

  // Initialize media stream
  useEffect(() => {
    const initStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request user media
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: options.audio,
          video: options.video,
        });

        setStream(mediaStream);
        setHasCamera(!!options.video);
        setHasMicrophone(!!options.audio);
      } catch (err) {
        console.error("Error accessing media devices:", err);

        // Handle specific errors
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            setError(
              "Permission denied. Please allow access to camera and microphone."
            );
          } else if (err.name === "NotFoundError") {
            setError(
              "No camera or microphone found. Please check your devices."
            );
          } else {
            setError(`Error accessing media: ${err.message}`);
          }
        } else {
          setError("An unknown error occurred while accessing media devices.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initStream();
  }, [options.audio, options.video]);

  // Toggle camera
  const toggleCamera = useCallback(
    (enabled: boolean) => {
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = enabled;
        });
        setHasCamera(enabled);
      }
    },
    [stream]
  );

  // Toggle microphone
  const toggleMicrophone = useCallback(
    (enabled: boolean) => {
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = enabled;
        });
        setHasMicrophone(enabled);
      }
    },
    [stream]
  );

  // Start screen sharing
  const startScreenShare =
    useCallback(async (): Promise<MediaStream | null> => {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        // Stop any previous screen share
        if (screenStream) {
          screenStream.getTracks().forEach((track) => track.stop());
        }

        setScreenStream(displayStream);

        // Handle when user stops sharing via browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        return displayStream;
      } catch (err) {
        console.error("Error starting screen share:", err);
        setError("Failed to start screen sharing");
        return null;
      }
    }, [screenStream, stopScreenShare]);

  // Stop all streams
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  }, [stream, screenStream]);

  return {
    stream,
    error,
    isLoading,
    hasCamera,
    hasMicrophone,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    stopStream,
  };
};
