import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useSnapshot } from "valtio";
import { cameraState } from "~/state/camera-state";
import { Button } from "~/ui/Button";

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
      { signal: abortCtrl.signal }
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
    // accessControl = <Button>Done!</Button>;
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

  return (
    <div className="flex flex-col gap-3 text-center items-center">
      <AnimatePresence mode="wait" initial>
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
          <h3 className="text-4xl text-balance">{heading}</h3>
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
      </AnimatePresence>
      <div className="fixed bottom-4 md:bottom-8 left-2 right-2 text-lg font-serif leading-[1.4]">
        <AnimatePresence mode="wait">
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
