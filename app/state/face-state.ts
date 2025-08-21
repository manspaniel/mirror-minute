import {
  detectSingleFace,
  Point as FacePoint,
  loadFaceDetectionModel,
  loadFaceLandmarkModel,
  loadFaceLandmarkTinyModel,
  loadTinyFaceDetectorModel,
} from "face-api.js";
import { proxy, useSnapshot } from "valtio";
import { cameraState } from "./camera-state";
import { Vec2 } from "ogl";

function createFaceStore() {
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
    facing: {
      horizontal: 0,
      vertical: 0,
      positionX: 0,
      positionY: 0,
    },
  });

  async function loadModels() {
    await loadTinyFaceDetectorModel("/");
    await loadFaceLandmarkModel("/");
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
      return;
    }
    const result = await detectSingleFace(cameraState.video).withFaceLandmarks(
      true
    );

    if (!result?.landmarks) return;

    const box = result.detection.box;

    store.hasFace = true;
    store.faceParts.jaw = result?.landmarks.getJawOutline();
    store.faceParts.leftEye = result?.landmarks.getLeftEye();
    store.faceParts.rightEye = result?.landmarks.getRightEye();
    store.faceParts.mouth = result?.landmarks.getMouth();
    store.faceParts.nose = result?.landmarks.getNose();

    const eyeLeft = getMeanPosition(store.faceParts.leftEye);
    const eyeRight = getMeanPosition(store.faceParts.rightEye);
    const nose = getMeanPosition(store.faceParts.nose);
    const mouth = getMeanPosition(store.faceParts.mouth);
    const jawY = getTop(store.faceParts.jaw);

    const rx = (jawY - mouth.y) / box.height;
    const ry = (eyeLeft.x + (eyeRight.x - eyeLeft.x) / 2 - nose.x) / box.width;

    console.log(rx.toFixed(3), ry.toFixed(3));

    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // function drawPath(path: FacePoint[]) {
    //   ctx.beginPath();
    //   for (const p of path) {
    //     ctx.lineTo(p.x, p.y);
    //   }
    //   ctx.closePath();
    //   ctx.stroke();
    // }

    // drawPath(leftEye ?? []);
    // drawPath(rightEye ?? []);
    // drawPath(mouth ?? []);
    // drawPath(jaw ?? []);
    // drawPath(nose ?? []);
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
