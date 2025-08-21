import { atom, useAtom, useStore } from "jotai";
import { atomWithReset, atomWithStorage } from "jotai/utils";
import { useEffect, useState } from "react";

// Flow state parameters
const hasDismissedLanding = atom(false);
const hasAcknowledgedCameraAccess = atom(false);

const cameraStream = atom<MediaStream | null>(null);
const cameraPermissionsStatus = atom<
  "notrequested" | "pending" | "rejected" | "accepted" | "error" | "nocamera"
>("notrequested");
const preferredCameraId = atom<string | null>(null);

const hasStarted = atom(false);
const timeRemaining = atomWithReset(60);
const hasCompleted = atom(false);

const ctas = {
  hasShared: atom(false),
  hasDonated: atom(false),
};

// Screen state
export type CurrentScreen =
  | "landing"
  | "cameraPrompt"
  | "challengePrep"
  | "challenge"
  | "completion"
  | "howDoYouFeel"
  | "ctas";
const currentScreen = atom<CurrentScreen>((get) => {
  console.log("get(hasDismissedLanding)", get(hasDismissedLanding));
  if (!get(hasDismissedLanding)) {
    return "landing";
  } else if (
    !get(hasAcknowledgedCameraAccess) ||
    get(cameraPermissionsStatus) !== "accepted"
  ) {
    return "cameraPrompt";
  } else if (!get(hasStarted)) {
    return "challengePrep";
  } else if (!get(hasCompleted)) {
    return "challenge";
  } else {
    return "howDoYouFeel";
  }
});

// Tracking
const hasCompletedBefore = atomWithStorage("completed_before", false);

export function useCurrentScreen() {
  const [screen] = useAtom(currentScreen);
  return screen;
}

export function useSplashScreen() {
  const [dismissed, setDismissed] = useAtom(hasDismissedLanding);

  console.log({ dismissed });
  return {
    next() {
      console.log("Dismissing");
      setDismissed(true);
    },
  };
}

export function useCameraAccess() {
  const [deviceId] = useAtom(preferredCameraId);
  const [status, setStatus] = useAtom(cameraPermissionsStatus);
  const store = useStore();

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (status !== "accepted") return;
    const abortCtrl = new AbortController();
    async function refresh() {
      const result = await navigator.mediaDevices.enumerateDevices();
      const devices = result.filter((device) => device.kind === "videoinput");
      setDevices(devices);
    }
    navigator.mediaDevices.addEventListener(
      "devicechange",
      async () => {
        refresh();
      },
      { signal: abortCtrl.signal }
    );
    refresh();
    return () => abortCtrl.abort();
  }, [status === "accepted"]);

  async function ensureCameraAccess() {
    const tmp = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // Immediately stop, we only wanted to unlock labels
    tmp.getTracks().forEach((t) => t.stop());
  }

  async function requestCameraAccess() {
    // Stop any current stream
    const stream = store.get(cameraStream);
    stream?.getTracks().forEach((t) => t.stop());

    setStatus("pending");

    ensureCameraAccess().catch((err) => {
      setStatus("error");
    });

    let deviceId = store.get(preferredCameraId);
    if (!deviceId) {
      deviceId = devices[0]?.deviceId;
    }

    // Get the new stream
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: deviceId,
        },
      })
      .then((mediaStream) => {
        setStatus("accepted");
        store.set(cameraStream, mediaStream);
        console.log("Got media stream", mediaStream);
      })
      .catch((err) => {
        setStatus("error");
        console.log("Error getting camera stream", err);
      });
  }

  return {
    status,
    devices,
    deviceId,
    switchDevice(id: string) {
      store.set(preferredCameraId, id);
      requestCameraAccess();
    },
    async start() {
      requestCameraAccess();
    },
  };
}
