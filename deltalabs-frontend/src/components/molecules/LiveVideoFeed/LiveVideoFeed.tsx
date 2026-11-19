/**
 * LiveVideoFeed — a self-contained live `<video>` tile that renders a shared
 * camera `MediaStream`. Each instance owns its own local `<video>` ref and
 * attaches the stream in an effect, so the same acquired stream can be shown in
 * *multiple* places at once (a participant's full-bleed rectangle tile, the
 * host stage, a small corner preview) without the single-ref collision that
 * your old `videoRef`-shared approach hit.
 *
 * `mirror` flips the feed horizontally — required for any self-view (like Zoom,
 * your own camera is mirrored so your movement feels natural).
 *
 * @example
 * ```tsx
 * <LiveVideoFeed mediaStream={stream} mirror className="size-full rounded-xl" />
 * ```
 */

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface LiveVideoFeedProps {
  /** The live media stream to render. When null the tile stays empty. */
  mediaStream: MediaStream | null;
  /** Mirrors the feed horizontally — set for self-view camera feeds. */
  mirror?: boolean;
  /**
   * Mutes the element. Defaults to `true` for self-view tiles (preventing
   * feedback); set `false` for *remote* feeds whose audio must be heard.
   */
  muted?: boolean;
  /** Rounded shape: "square" | "rounded" | "circle". Default: "rounded". */
  shape?: "square" | "rounded" | "circle";
  className?: string;
}

export function LiveVideoFeed({
  mediaStream,
  mirror = false,
  muted = true,
  shape = "rounded",
  className,
}: Readonly<LiveVideoFeedProps>) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    video.srcObject = mediaStream;
    if (mediaStream) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err: unknown) => {
          // If browser blocks unmuted remote autoplay before user gesture,
          // play with mute fallback so the video feed never fails to appear.
          if (err instanceof DOMException && err.name === "NotAllowedError" && !muted) {
            video.muted = true;
            void video.play().catch(() => {});
          }
        });
      }
    }

    const handleTrackChange = () => {
      if (video && mediaStream) {
        if (video.srcObject !== mediaStream) {
          video.srcObject = mediaStream;
        }
        void video.play().catch(() => {});
      }
    };

    mediaStream?.addEventListener("addtrack", handleTrackChange);
    mediaStream?.addEventListener("removetrack", handleTrackChange);

    return () => {
      mediaStream?.removeEventListener("addtrack", handleTrackChange);
      mediaStream?.removeEventListener("removetrack", handleTrackChange);
      if (video) {
        video.srcObject = null;
      }
    };
  }, [mediaStream, muted]);

  const shapeClasses: Record<NonNullable<LiveVideoFeedProps["shape"]>, string> = {
    square: "rounded-none",
    rounded: "rounded-xl",
    circle: "rounded-full",
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      aria-hidden
      className={cn(
        "pointer-events-none object-cover",
        mirror && "-scale-x-100",
        shapeClasses[shape],
        className,
      )}
    />
  );
}

export default LiveVideoFeed;
