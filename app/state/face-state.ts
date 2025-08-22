import {
  detectSingleFace,
  Point as FacePoint,
  loadFaceDetectionModel,
  loadFaceLandmarkTinyModel,
  loadTinyFaceDetectorModel,
} from "face-api.js";
import { MotionValue, motionValue, springValue } from "motion/react";
import { Vec2 } from "ogl";
import { proxy, ref, useSnapshot } from "valtio";
import { mapRange } from "~/utils/math";
import { cameraState } from "./camera-state";

export type FacingSprings = Record<
  "yaw" | "pitch" | "posX" | "posY" | "validity",
  MotionValue<number>
>;

function createFaceStore() {
  const rawFacing: FacingSprings = {
    yaw: motionValue(0),
    pitch: motionValue(0),
    posX: motionValue(0),
    posY: motionValue(0),
    validity: motionValue(1),
  };

  const springFacing: FacingSprings = {
    yaw: springValue(rawFacing.yaw, {
      stiffness: 600,
      bounce: 0,
      damping: 50,
      mass: 5,
    }),
    pitch: springValue(rawFacing.pitch, {
      stiffness: 600,
      bounce: 0,
      damping: 50,
      mass: 5,
    }),
    posX: springValue(rawFacing.posX, {
      stiffness: 600,
      bounce: 0,
      damping: 50,
    }),
    posY: springValue(rawFacing.posY, {
      stiffness: 600,
      bounce: 0,
      damping: 50,
    }),
    validity: springValue(rawFacing.validity, {
      stiffness: 600,
      bounce: 0,
      damping: 50,
    }),
  };

  const store = proxy({
    modelsLoaded: false,
    modelsFailed: false,
    hasFace: false,
    setHasFace(value: boolean) {
      return value;
    },
    faceParts: {} as Record<
      "mouth" | "leftEye" | "rightEye" | "jaw" | "nose",
      FacePoint[] | undefined
    >,
    runUpdate() {
      updateFaceTracking();
    },
    facing: ref(springFacing),
  });

  async function loadModels() {
    await loadTinyFaceDetectorModel("/");
    // await loadFaceLandmarkModel("/");
    await loadFaceDetectionModel("/");
    await loadFaceLandmarkTinyModel("/");
  }

  function getMeanPosition(points: FacePoint[]) {
    const pos = new Vec2(0, 0);
    for (let p of points) {
      pos.x += p.x;
      pos.y += p.y;
    }
    pos.x /= points.length;
    pos.y /= points.length;
    return pos;
  }

  function getTop(points: FacePoint[]) {
    let value = points[0].y;
    for (let p of points) {
      if (p.y > value) {
        value = p.y;
      }
    }
    return value;
  }

  async function updateFaceTracking() {
    if (!cameraState.video || !store.modelsLoaded) {
      store.hasFace = false;
      rawFacing.validity.set(1);
      return;
    }
    const result = await detectSingleFace(cameraState.video).withFaceLandmarks(
      true
    );

    if (!result?.landmarks) {
      store.hasFace = false;
      rawFacing.validity.set(1);
      return;
    }

    const box = result.detection.box;

    store.hasFace = true;
    store.faceParts.jaw = result?.landmarks.getJawOutline();
    store.faceParts.leftEye = result?.landmarks.getLeftEye();
    store.faceParts.rightEye = result?.landmarks.getRightEye();
    store.faceParts.mouth = result?.landmarks.getMouth();
    store.faceParts.nose = result?.landmarks.getNose();

    const eyeLeft = getMeanPosition(store.faceParts.leftEye);
    const eyeRight = getMeanPosition(store.faceParts.rightEye);
    const nose = store.faceParts.nose[3];
    const mouth = getMeanPosition(store.faceParts.mouth);
    const jawY = getTop(store.faceParts.jaw);

    let pitch = (jawY - mouth.y) / box.height;
    let yaw = (eyeLeft.x + (eyeRight.x - eyeLeft.x) / 2 - nose.x) / box.width;

    pitch = mapRange(pitch, 0.15, 0.3, -1, 1);
    yaw = mapRange(yaw, -0.1, 0.1, -1, 1);

    // pitch = pitch > 0 ? Math.pow(pitch, 2) : -Math.pow(-pitch, 2);

    rawFacing.pitch.set(pitch);
    rawFacing.yaw.set(yaw);
    rawFacing.posX.set((box.x + box.width / 2) / cameraState.video.videoWidth);
    rawFacing.posY.set(
      (box.y + box.height / 2) / cameraState.video.videoHeight
    );

    rawFacing.validity.set(
      mapRange(pitch, 0.15, 0.27, -1, 1)
      // Math.pow(Math.abs(pitch / 0.2), 1.1) +
      //   Math.pow(Math.abs((yaw - 0.24) / 0.2), 1.1)
    );
  }

  loadModels()
    .then(() => {
      store.modelsLoaded = true;
    })
    .catch((err) => {
      store.modelsFailed = true;
      console.error("Failed to load face-api.js models", err);
    });

  return store;
}

export const faceStore = createFaceStore();

export function useFaceState() {
  return useSnapshot(faceStore);
}
