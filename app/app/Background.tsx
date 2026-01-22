import { useEffect, useRef, useState } from "react";
import { useCameraState } from "~/state/camera-state";
import { faceStore, useFaceState } from "~/state/face-state";
import { MirrorCanvas } from "./canvas/MirrorCanvas";
import { subscribe } from "valtio";
import { useAnimationFrame, useMotionValueEvent } from "motion/react";
import { challengeState, useChallengeState } from "~/state/challenge-state";
import { useAppState } from "~/state/app-state";
import { shareStore } from "~/state/share-state";

export function Background() {
  const camera = useCameraState();
  const faceState = useFaceState();
  const appState = useAppState();
  const challenge = useChallengeState();

  const ref = useRef<HTMLDivElement>(null!);

  const [mirror, setMirror] = useState<MirrorCanvas>(null!);

  useEffect(() => {
    const mirror = new MirrorCanvas(ref.current);
    setMirror(mirror);
    return () => mirror.dispose();
  }, [MirrorCanvas, ref]);

  useEffect(() => {
    if (!mirror) return;
    if (appState.screen === "failure") {
      mirror.setFailed();
      return;
    }
    const timer = setTimeout(() => {
      mirror.setBackgroundMode(appState.screen === "challenge" ? false : true);
      mirror.setGuideVisibility(appState.screen === "challenge");
    }, 50);
    return () => clearTimeout(timer);
  }, [mirror, appState.screen]);

  useEffect(() => {
    async function checkCapture() {
      const percent = challenge.timeRemaining / challenge.totalDuration;
      const imagesTaken = shareStore.images.length;
      const targetImageCount = 3;
      if (
        percent <= (targetImageCount - imagesTaken) / targetImageCount &&
        challenge.running
      ) {
        const image = await mirror.captureImage();
        if (image) {
          shareStore.images.push(image);
          // console.log("Captured image", image, "at", percent, "progress");
        }
      }
    }
    checkCapture();
  }, [challenge.running, challenge.timeRemaining]);

  useEffect(() => {
    if (appState.screen === "complete") {
    }
  }, [appState.screen]);

  useEffect(() => {
    if (!mirror) return;
    if (faceState.faceWarnings.length > 0) {
      mirror.setChallengeStarted(false);
    } else if (challenge.running) {
      mirror.setChallengeStarted(true);
    } else {
      mirror.setChallengeStarted(false);
    }
  }, [mirror, challenge.running, faceState.faceWarnings]);

  useEffect(() => {
    if (!mirror) return;
    if (camera.video) {
      mirror.setCameraVideo(camera.video as HTMLVideoElement);
    } else {
      mirror.clearCameraVideo();
    }
  }, [camera.video, mirror]);

  // Update face detection on a schedule, when needed
  useEffect(() => {
    if (!camera.video) return;

    const timer = setInterval(() => {
      if (challenge.completed) return;
      faceState.runUpdate();
    }, 200);
    return () => clearTimeout(timer);
  }, [camera.video]);

  // useEffect(() => {
  //   return subscribe(faceStore, () => {
  //     if (mirror && faceStore.faceParts) {
  //       mirror.drawDebugFaceParts(faceStore.faceParts);
  //     }
  //   });
  // }, [mirror]);

  const debug = useRef<HTMLDivElement>(null);

  useAnimationFrame(() => {
    if (debug.current) {
      debug.current.innerHTML = Object.entries(faceState.facing)
        .map(([key, val]) => key + ": " + val.get().toFixed(3))
        .join(", ");
    }
  });

  return (
    <div ref={ref} className="absolute inset-0">
      {/* <div
        className="absolute z-50 text-center font-mono left-0 bottom-0 right-0 text-xs"
        ref={debug}
      ></div> */}
    </div>
  );
}
