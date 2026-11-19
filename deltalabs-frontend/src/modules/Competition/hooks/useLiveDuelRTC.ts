/**
 * useLiveDuelRTC
 * WebRTC mesh for a Live Duel room. Maintains one `RTCPeerConnection` per
 * remote participant (host + joiners), continuously negotiating offers/answers
 * and ICE candidates through the room channel (`sendSignal` per the
 * `MEDIA_SIGNAL` relay) and exposing the received remote camera streams keyed
 * by participant id so the participant grid can render every side's live video.
 *
 * Signalling avoids offer/answer glare with a deterministic role: the side with
 * the lexicographically smaller user id initiates the first offer, and both
 * sides refuse to offer while a negotiation is already in flight
 * (`signalingState !== "stable"`). Later track changes fall back to
 * `onnegotiationneeded` on whichever side changed. Inbound `media-state`
 * signals update remote tile indicators via `onRemoteMediaState`.
 *
 * The mesh relies on the local `mediaStream` produced by `useLiveMediaStream`
 * (a persistent audio track + live video track while the camera is on) —
 * toggling the camera off removes the video sender but keeps mic audio flowing.
 *
 * @example
 * ```tsx
 * const { handleSignal, remoteStreams } = useLiveDuelRTC({
 *   enabled: isBackendRoom && connected && Boolean(userId),
 *   userId,
 *   remoteUserIds,
 *   localStream: mediaStream,
 *   isCameraOff,
 *   isMicMuted,
 *   sendSignal,
 *   onRemoteMediaState: (id, media) =>
 *     dispatch({ type: "UPDATE_PARTICIPANT_MEDIA", payload: { id, ...media } }),
 * });
 * useLiveDuelSocket({ ..., onSignal: handleSignal });
 * ```
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LiveMediaState, LiveMediaSignal } from "@/modules/Competition/types/liveDuel";

/** Public STUN (host candidates still cover the same-machine/LAN dev case). */
const RTC_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export interface UseLiveDuelRTCOptions {
  /** Run the mesh only for backend rooms with an authenticated user + socket. */
  enabled: boolean;
  /** Current user's account id (backend roster `id`). */
  userId: string | null;
  /** Participant ids to peer with (everyone except the current user). */
  remoteUserIds: string[];
  /** Local camera+mic stream maintained by `useLiveMediaStream`. */
  localStream: MediaStream | null;
  isCameraOff: boolean;
  isMicMuted: boolean;
  sendSignal: (signal: Omit<LiveMediaSignal, "fromUserId">) => boolean;
  /** Remote hardware state (media-state signals) → tile indicators. */
  onRemoteMediaState?: (participantId: string, media: LiveMediaState) => void;
}

export interface UseLiveDuelRTCResult {
  /** Feed every inbound `MEDIA_SIGNAL` echo from the socket here. */
  handleSignal: (signal: LiveMediaSignal) => void;
  /** Remote camera streams keyed by participant id (rendered in the grid). */
  remoteStreams: Readonly<Record<string, MediaStream>>;
  /** Active peer connections (diagnostics). */
  peerCount: number;
}

export function useLiveDuelRTC({
  enabled,
  userId,
  remoteUserIds,
  localStream,
  isCameraOff,
  isMicMuted,
  sendSignal,
  onRemoteMediaState,
}: Readonly<UseLiveDuelRTCOptions>): UseLiveDuelRTCResult {
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Readonly<Record<string, MediaStream>>>({});
  const [peerCount, setPeerCount] = useState(0);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const sendSignalRef = useRef(sendSignal);
  sendSignalRef.current = sendSignal;
  const onRemoteMediaStateRef = useRef(onRemoteMediaState);
  onRemoteMediaStateRef.current = onRemoteMediaState;
  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;

  const commitRemoteStreams = useCallback(() => {
    const next: Record<string, MediaStream> = {};
    remoteStreamsRef.current.forEach((stream, id) => {
      next[id] = stream;
    });
    setRemoteStreams(next);
  }, []);

  const syncTracksIntoPeer = useCallback((peerId: string) => {
    const pc = peersRef.current.get(peerId);
    if (!pc) {
      return;
    }
    const stream = localStreamRef.current;
    const audioTrack = stream?.getAudioTracks()[0] ?? null;
    const videoTrack = stream?.getVideoTracks()[0] ?? null;

    const senders = pc.getSenders();
    const audioSender = senders.find(
      (s) => s.track?.kind === "audio" || (s as { _kind?: string })._kind === "audio",
    );
    const videoSender = senders.find(
      (s) => s.track?.kind === "video" || (s as { _kind?: string })._kind === "video",
    );

    // Sync audio sender
    if (audioSender && audioTrack && audioSender.track !== audioTrack) {
      void audioSender.replaceTrack(audioTrack);
    } else if (audioTrack && !audioSender && stream) {
      const sender = pc.addTrack(audioTrack, stream);
      (sender as { _kind?: string })._kind = "audio";
    }

    // Sync video sender
    if (videoSender) {
      if (videoTrack) {
        if (videoSender.track !== videoTrack) {
          void videoSender.replaceTrack(videoTrack);
        }
      } else if (videoSender.track) {
        void videoSender.replaceTrack(null);
      }
    } else if (videoTrack && stream) {
      const sender = pc.addTrack(videoTrack, stream);
      (sender as { _kind?: string })._kind = "video";
    }
  }, []);

  const ensurePeer = useCallback(
    (peerId: string) => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        return existing;
      }

      const pc = new RTCPeerConnection({ iceServers: RTC_ICE_SERVERS });
      peersRef.current.set(peerId, pc);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalRef.current?.({
            type: "ice",
            toUserId: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        const receivers = pc.getReceivers();
        const activeTracks = receivers
          .map((r) => r.track)
          .filter((t): t is MediaStreamTrack => Boolean(t));
        const stream = event.streams[0] ?? new MediaStream(activeTracks);
        for (const t of activeTracks) {
          if (!stream.getTracks().some((existingTrack) => existingTrack.id === t.id)) {
            stream.addTrack(t);
          }
        }
        // Fresh wrapper ensures React consumers re-evaluate
        remoteStreamsRef.current.set(peerId, new MediaStream(stream.getTracks()));
        commitRemoteStreams();

        event.track.onended = () => {
          const remaining = pc
            .getReceivers()
            .map((r) => r.track)
            .filter((t): t is MediaStreamTrack => Boolean(t) && t.readyState === "live");
          remoteStreamsRef.current.set(peerId, new MediaStream(remaining));
          commitRemoteStreams();
        };
      };

      // W3C Perfect Negotiation: onnegotiationneeded triggers offer
      pc.onnegotiationneeded = async () => {
        try {
          makingOfferRef.current.set(peerId, true);
          const offer = await pc.createOffer();
          if (pc.signalingState !== "stable") {
            return;
          }
          await pc.setLocalDescription(offer);
          if (pc.localDescription) {
            sendSignalRef.current?.({
              type: "offer",
              toUserId: peerId,
              sdp: pc.localDescription.toJSON(),
            });
          }
        } catch {
          // Negotiation collision or superseded
        } finally {
          makingOfferRef.current.set(peerId, false);
        }
      };

      syncTracksIntoPeer(peerId);
      setPeerCount(peersRef.current.size);
      return pc;
    },
    [commitRemoteStreams, syncTracksIntoPeer],
  );

  const flushPendingCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const pending = pendingCandidatesRef.current.get(peerId);
    if (!pending) {
      return;
    }
    pendingCandidatesRef.current.delete(peerId);
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Stale candidate for an already-renegotiated description.
      }
    }
  }, []);

  // Reconcile the peer set whenever the on-stage roster changes.
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }
    const remoteIds = new Set(remoteUserIds.filter((id) => id !== userId));
    for (const id of remoteIds) {
      ensurePeer(id);
      // Immediately notify the newly linked peer of our current camera & mic state
      sendSignalRef.current?.({
        type: "media-state",
        toUserId: id,
        media: { cameraOff: isCameraOff, micMuted: isMicMuted },
      });
    }
    for (const id of [...peersRef.current.keys()]) {
      if (!remoteIds.has(id)) {
        peersRef.current.get(id)?.close();
        peersRef.current.delete(id);
        remoteStreamsRef.current.delete(id);
        pendingCandidatesRef.current.delete(id);
        makingOfferRef.current.delete(id);
      }
    }
    setPeerCount(peersRef.current.size);
    commitRemoteStreams();
  }, [enabled, userId, remoteUserIds, isCameraOff, isMicMuted, ensurePeer, commitRemoteStreams]);

  // Keep every peer's senders in sync with the local camera+mic stream, and
  // broadcast our hardware state so remote tiles update immediately.
  useEffect(() => {
    if (!enabled || !userId || peersRef.current.size === 0) {
      return;
    }
    for (const peerId of peersRef.current.keys()) {
      syncTracksIntoPeer(peerId);
    }
    sendSignalRef.current?.({
      type: "media-state",
      media: { cameraOff: isCameraOff, micMuted: isMicMuted },
    });
  }, [enabled, userId, localStream, isCameraOff, isMicMuted, syncTracksIntoPeer]);

  // Close every peer connection on unmount.
  useEffect(() => {
    const peers = peersRef.current;
    const remoteStreams = remoteStreamsRef.current;
    const pendingCandidates = pendingCandidatesRef.current;
    const makingOffers = makingOfferRef.current;
    return () => {
      for (const pc of peers.values()) {
        pc.close();
      }
      peers.clear();
      remoteStreams.clear();
      pendingCandidates.clear();
      makingOffers.clear();
    };
  }, []);

  const handleSignal = useCallback(
    (signal: LiveMediaSignal) => {
      if (!enabledRef.current || !userIdRef.current) {
        return;
      }
      const fromUserId = signal.fromUserId;
      if (!fromUserId || fromUserId === userIdRef.current) {
        return;
      }
      if (signal.toUserId && signal.toUserId !== userIdRef.current) {
        return;
      }

      switch (signal.type) {
        case "offer": {
          const pc = ensurePeer(fromUserId);
          const makingOffer = makingOfferRef.current.get(fromUserId) ?? false;
          const isPolite = (userIdRef.current ?? "") > fromUserId;
          const offerCollision = makingOffer || pc.signalingState !== "stable";

          const processOffer = async () => {
            if (offerCollision) {
              if (!isPolite) {
                // Impolite peer drops colliding offer; polite peer rolls back
                return;
              }
              await pc.setLocalDescription({ type: "rollback" });
            }

            syncTracksIntoPeer(fromUserId);
            const sdpString =
              signal.sdp?.sdp ?? (typeof signal.sdp === "string" ? signal.sdp : "");
            if (!sdpString) {
              return;
            }
            await pc.setRemoteDescription({ type: "offer", sdp: sdpString });
            await flushPendingCandidates(fromUserId, pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (pc.localDescription) {
              sendSignalRef.current?.({
                type: "answer",
                toUserId: fromUserId,
                sdp: pc.localDescription.toJSON(),
              });
            }
          };

          void processOffer().catch(() => {
            // If renegotiation fails, drop peer so fresh offer recreates it
            pc.close();
            peersRef.current.delete(fromUserId);
            remoteStreamsRef.current.delete(fromUserId);
            makingOfferRef.current.delete(fromUserId);
            setPeerCount(peersRef.current.size);
            commitRemoteStreams();
          });
          break;
        }
        case "answer": {
          const pc = ensurePeer(fromUserId);
          if (pc.signalingState !== "have-local-offer") {
            return;
          }
          const sdpString =
            signal.sdp?.sdp ?? (typeof signal.sdp === "string" ? signal.sdp : "");
          if (!sdpString) {
            return;
          }
          void pc
            .setRemoteDescription({ type: "answer", sdp: sdpString })
            .then(() => flushPendingCandidates(fromUserId, pc))
            .catch(() => {});
          break;
        }
        case "ice": {
          if (!signal.candidate) {
            return;
          }
          const pc = ensurePeer(fromUserId);
          if (pc.remoteDescription) {
            void pc.addIceCandidate(signal.candidate).catch(() => {});
          } else {
            const pending = pendingCandidatesRef.current.get(fromUserId) ?? [];
            pending.push(signal.candidate);
            pendingCandidatesRef.current.set(fromUserId, pending);
          }
          break;
        }
        case "media-state": {
          if (signal.media) {
            onRemoteMediaStateRef.current?.(fromUserId, signal.media);
          }
          break;
        }
        default:
          break;
      }
    },
    [ensurePeer, flushPendingCandidates, syncTracksIntoPeer, commitRemoteStreams],
  );

  return { handleSignal, remoteStreams, peerCount };
}

export default useLiveDuelRTC;