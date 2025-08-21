import { proxy, ref, useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";

function cameraStateStore() {
  const store = proxy({
    status: "notRequested" as
      | "notrequested"
      | "pending"
      | "rejected"
      | "accepted"
      | "error"
      | "nocamera",
    deviceId: null as null | string,
    switchDevice(deviceId: string) {
      store.deviceId = deviceId;
    },
    mediaStream: null as null | MediaStream,
    video: null as null | HTMLVideoElement,
    async stop() {
      if (store.mediaStream) {
        store.mediaStream.getTracks().forEach((t) => t.stop());
      }
    },
    async start() {
      await store.stop();

      try {
        store.status = "pending";
        const tmp = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        tmp.getTracks().forEach((t) => t.stop());
        store.status = "accepted";
      } catch (err) {
        store.status = "error";
        console.warn("Camera request error", err);
        return;
      }
    },
  });

  subscribeKey(store, "status", async () => {
    if (store.status === "accepted") {
      const constraints: MediaStreamConstraints[] = [];
      if (store.deviceId) {
        constraints.push({
          video: {
            deviceId: store.deviceId,
          },
        });
      }
      constraints.push({
        video: {
          facingMode: {
            ideal: "user",
          },
        },
      });
      constraints.push({
        video: true,
      });

      for (let constraint of constraints) {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        store.mediaStream = ref(stream);
        break;
      }

      if (!store.mediaStream) return;

      const video = document.createElement("video");
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      // Make sure we actually have frames to sample:
      await new Promise<void>((resolve) => {
        video.srcObject = store.mediaStream;
        const onReady = () => {
          video.removeEventListener("playing", onReady);
          resolve();
        };
        video.addEventListener("playing", onReady, { once: true });
        // Kick it if autoplay policy ever stalls:
        video.play().catch(() => {
          /* user gesture might be required in some contexts */
        });
      });
      store.video = ref(video);
    }
  });

  return store;
}

export const cameraState = cameraStateStore();

export function useCameraState() {
  return useSnapshot(cameraState);
}
