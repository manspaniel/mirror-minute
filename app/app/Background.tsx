import { useEffect, useRef, useState } from "react";
import { useCameraState } from "~/state/camera-state";
import { faceStore, useFaceState } from "~/state/face-state";
import { MirrorCanvas } from "./canvas/MirrorCanvas";
import { subscribe } from "valtio";
import { useAnimationFrame } from "motion/react";

export function Background() {
  const camera = useCameraState();
  const faceState = useFaceState();

  const ref = useRef<HTMLDivElement>(null!);

  const [mirror, setMirror] = useState<MirrorCanvas>(null!);

  useEffect(() => {
    const mirror = new MirrorCanvas(ref.current);
    setMirror(mirror);
    return () => mirror.dispose();
  }, [MirrorCanvas, ref]);

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
      faceState.runUpdate();
    }, 100);
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
    debug.current!.innerHTML = Object.entries(faceState.facing)
      .map(([key, val]) => key + ": " + val.get().toFixed(3))
      .join(", ");
  });

  return (
    <div ref={ref} className="absolute inset-0 bg-neutral-950">
      <div
        className="absolute z-50 text-center font-mono left-0 bottom-0 right-0"
        ref={debug}
      ></div>
    </div>
  );
}
