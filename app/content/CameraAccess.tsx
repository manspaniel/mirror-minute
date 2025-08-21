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
  let instructions: ReactNode = (
    <p>
      We're about to prompt you for camera access. Be sure to select 'Allow'.
    </p>
  );

  if (camera.status === "pending") {
    accessControl = <Button>Starting...</Button>;
  } else if (
    camera.status === "error" ||
    camera.status === "rejected" ||
    camera.status === "nocamera"
  ) {
    instructions = (
      <p>
        It looks like you didn't grant permissions for this website to access
        your camera! You may need to manually update your settings to allow for
        access.
      </p>
    );
    accessControl = <Button onClick={() => camera.start()}>Try again</Button>;
  } else if (camera.status === "accepted") {
    accessControl = <Button>Done!</Button>;
    // instructions = (
    //   <p>Alright! Let's make sure you've got the right camera selected</p>
    // );
    // accessControl = (
    //   <select
    //     value={camera.deviceId ?? ""}
    //     onChange={(e) => {
    //       camera.switchDevice(e.currentTarget.value);
    //     }}
    //   >
    //     {devices.map((device, i) => (
    //       <option key={device.deviceId ?? i} value={device.deviceId}>
    //         {device.label}
    //       </option>
    //     ))}
    //   </select>
    // );
  }

  return (
    <div className="flex flex-col gap-3 text-center items-center">
      <h3 className="text-4xl text-balance">
        We need camera access to continue
      </h3>
      <div>{instructions}</div>
      <div>{accessControl}</div>
    </div>
  );
}
