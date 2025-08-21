import { useEffect, useRef, useState } from "react";
import { useCameraState } from "~/state/camera-state";
import { faceStore, useFaceState } from "~/state/face-state";
import { MirrorCanvas } from "./canvas/MirrorCanvas";
import { subscribe } from "valtio";

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

  useEffect(() => {
    return subscribe(faceStore, () => {
      if (mirror && faceStore.faceParts) {
        mirror.drawDebugFaceParts(faceStore.faceParts);
      }
    });
  }, [mirror]);

  return <div ref={ref} className="absolute inset-0 bg-neutral-950"></div>;
}
