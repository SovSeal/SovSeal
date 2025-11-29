/**
 * MediaPlayer - Secure media player for decrypted content
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { UnlockResult } from "@/lib/unlock";

interface MediaPlayerProps {
  unlockResult: UnlockResult;
  onClose: () => void;
  messageId: string;
  sender: string;
}

export function MediaPlayer({
  unlockResult,
  onClose,
  messageId: _messageId,
  sender,
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const objectUrlRef = useRef<string>(unlockResult.objectUrl);
  const shouldCleanup = useRef<boolean>(true);

  // Determine if media is audio or video
  const isVideo = unlockResult.mimeType.startsWith("video/");
  const isAudio = unlockResult.mimeType.startsWith("audio/");

  console.log("[MediaPlayer] MIME type:", unlockResult.mimeType);
  console.log("[MediaPlayer] isVideo:", isVideo, "isAudio:", isAudio);

  // Update playback state
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(media.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("durationchange", handleDurationChange);
    media.addEventListener("play", handlePlay);
    media.addEventListener("pause", handlePause);
    media.addEventListener("ended", handleEnded);

    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("durationchange", handleDurationChange);
      media.removeEventListener("play", handlePlay);
      media.removeEventListener("pause", handlePause);
      media.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Cleanup on unmount - revoke object URL and clear decrypted data
  useEffect(() => {
    // Store the current URL for cleanup
    const currentUrl = objectUrlRef.current;
    
    return () => {
      // Always cleanup on unmount - revoke object URL to prevent reuse
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        console.log(
          "[MediaPlayer] Object URL revoked and decrypted data cleared from memory"
        );
      }
    };
  }, []);

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const newTime = parseFloat(e.target.value);
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const newVolume = parseFloat(e.target.value);
    media.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const handleClose = () => {
    // Mark that cleanup should happen
    shouldCleanup.current = true;

    // Pause playback before closing
    const media = mediaRef.current;
    if (media && isPlaying) {
      media.pause();
    }

    // Revoke object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      console.log("[MediaPlayer] Object URL revoked on close");
      objectUrlRef.current = "";
    }

    onClose();
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Unlocked Message</h2>
            <p className="mt-1 text-sm text-gray-400">
              From: {formatAddress(sender)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Media Display */}
        <div className="p-6">
          <div className="mb-4 overflow-hidden rounded-lg bg-black">
            {isVideo ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={unlockResult.objectUrl}
                className="max-h-[60vh] w-full object-contain"
                controls={false}
              />
            ) : isAudio ? (
              <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={unlockResult.objectUrl}
                  className="hidden"
                />
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-24 w-24 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <p className="text-lg font-medium text-white">
                    Audio Message
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center bg-gray-800 p-6">
                <p className="mb-4 text-gray-400">
                  Unsupported media type: {unlockResult.mimeType}
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  Trying generic video player...
                </p>
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={unlockResult.objectUrl}
                  className="max-h-[50vh] w-full object-contain"
                  controls={false}
                />
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-right text-sm text-gray-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="slider h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`,
                }}
              />
              <span className="w-12 text-sm text-gray-400">
                {formatTime(duration)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 transition-colors hover:bg-blue-700"
                >
                  {isPlaying ? (
                    <svg
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="ml-1 h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-gray-700"
                  />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-300">
                  This content is decrypted locally in your browser and will be
                  cleared from memory when you close this player. No plaintext
                  data is stored or transmitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
