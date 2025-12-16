import { AnimatePresence } from "motion/react";
import { type ReactNode } from "react";
import { CameraAccess } from "~/content/CameraAccess";
import { LandingScreen } from "~/content/LandingScreen";
import { ModalScreen } from "~/layouts/ModalScreen";
import { appState, useAppState } from "~/state/app-state";
import { useCameraState } from "~/state/camera-state";
import { useChallengeState } from "~/state/challenge-state";

export function Screens() {
  const state = useAppState();
  const camera = useCameraState();
  const challenge = useChallengeState();

  let screenContent: ReactNode = null;

  if (state.screen === "landing") {
    screenContent = (
      <ModalScreen key="landingScreen">
        <LandingScreen />
      </ModalScreen>
    );
  } else if (state.screen === "camera") {
    screenContent = (
      <ModalScreen key="cameraAccess">
        <CameraAccess />
      </ModalScreen>
    );
  } else if (state.screen === "challenge") {
  }

  return (
    <AnimatePresence mode="wait" initial={true}>
      {screenContent}
    </AnimatePresence>
  );
}
