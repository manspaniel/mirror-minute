import { AnimatePresence } from "motion/react";
import { type ReactNode } from "react";
import { CameraAccess } from "~/content/CameraAccess";
import { LandingContent } from "~/content/LandingContent";
import { ModalScreen } from "~/layouts/ModalScreen";
import { useAppState } from "~/state/app-state";
import { useCameraState } from "~/state/camera-state";

export function Screens() {
  const state = useAppState();
  const camera = useCameraState();

  let screenContent: ReactNode = null;

  if (!state.hasDismissedLanding) {
    screenContent = (
      <ModalScreen key="landingScreen">
        <LandingContent />
      </ModalScreen>
    );
  } else if (!camera.mediaStream) {
    screenContent = (
      <ModalScreen key="cameraAccess">
        <CameraAccess />
      </ModalScreen>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {screenContent}
    </AnimatePresence>
  );
}
