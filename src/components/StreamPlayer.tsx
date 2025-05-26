"use client";

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  url: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function StreamPlayer({ url, onLoad, onError }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("Video and hls.js are now bound together !");
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest loaded, found levels!");
        onLoad?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          onError?.();
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        onLoad?.();
      });
      video.addEventListener('error', () => {
        onError?.();
      });
    }
  }, [url, onLoad, onError]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full"
      controls
      autoPlay
      playsInline
    />
  );
}
