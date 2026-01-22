import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useSnapshot } from "valtio";
import { appState } from "~/state/app-state";
import { cameraState } from "~/state/camera-state";
import { useFaceState } from "~/state/face-state";
import { Button } from "~/ui/Button";
import { BURST, DIAMOND } from "~/ui/svgs";

export function CameraAccess() {
  const camera = useSnapshot(cameraState);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (camera.status !== "accepted") return;
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
      { signal: abortCtrl.signal },
    );
    refresh();
    return () => abortCtrl.abort();
  }, [camera.status === "accepted"]);

  let accessControl: ReactNode = (
    <Button onClick={() => camera.start()}>Start Camera</Button>
  );
  let heading = "We need access to your camera to continue";
  let instructions =
    "We're about to prompt you for camera access. Be sure to select 'Allow'";
  let connected = false;

  if (camera.status === "pending") {
    accessControl = <Button loading>Starting...</Button>;
    instructions = "Please allow access to continue";
  } else if (
    camera.status === "error" ||
    camera.status === "rejected" ||
    camera.status === "nocamera"
  ) {
    heading = "Couldn't connect";
    instructions =
      "It looks like you didn't grant permissions for this website to access your camera!\nYou may need to manually update your settings to allow for access.";
    accessControl = <Button onClick={() => camera.start()}>Try again</Button>;
  } else if (camera.status === "accepted") {
    heading = "Connected!";
    accessControl = null;
    connected = true;
    instructions = "";
    // instructions = (
    //   <p>Alright! Let's make sure you've got the right camera selected</p>
    // );
    // accessControl = (
    //   <>
    //     <select
    //       value={camera.deviceId ?? ""}
    //       onChange={(e) => {
    //         camera.switchDevice(e.currentTarget.value);
    //       }}
    //     >
    //       {devices.map((device, i) => (
    //         <option key={device.deviceId ?? i} value={device.deviceId}>
    //           {device.label}
    //         </option>
    //       ))}
    //     </select>
    //     <Button onClick={() => camera.start()}>Start Camera</Button>
    //   </>
    // );
  }

  const faceState = useFaceState();

  useEffect(() => {
    if (camera.status === "accepted" && faceState.hasRun) {
      const timer = setTimeout(() => {
        appState.doneWithCamera();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [camera.status, faceState.hasRun]);

  return (
    <div className="flex flex-col gap-3 text-center items-center text-indigo-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { delay: 0.2, duration: 1 },
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={heading}
        className="flex flex-col gap-5 text-center items-center"
      >
        <h3
          className={
            "text-balance relative " + (connected ? "text-5xl" : "text-4xl")
          }
        >
          {heading}
          <AnimatePresence initial>
            {connected && (
              <>
                <motion.div
                  key="diamond"
                  initial={{ rotate: "90deg", scale: 0.5, opacity: 0 }}
                  animate={{
                    rotate: "0",
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 0.4 },
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute left-[-1.1em] top-[-0.4em] size-[0.7em]"
                >
                  {DIAMOND}
                </motion.div>
                <motion.div
                  key="burst"
                  initial={{ rotate: "-45deg", scale: 0.5, opacity: 0 }}
                  animate={{
                    rotate: "0",
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 0.9 },
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute right-[-1.6em] top-[0.4em] size-[1.2em]"
                >
                  {BURST}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </h3>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { delay: 0.2, duration: 1 },
          }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {accessControl}
        </motion.div>
      </motion.div>
      <div className="fixed bottom-4 md:bottom-8 max-md:p-2 left-2 right-2 text-lg font-serif leading-[1.4]">
        <AnimatePresence mode="wait" propagate>
          <motion.div
            key={instructions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:whitespace-pre-wrap"
          >
            {instructions}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
