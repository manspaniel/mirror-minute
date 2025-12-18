import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";
import { CameraAccess } from "~/content/CameraAccess";
import { LandingScreen } from "~/content/LandingScreen";
import { ModalScreen } from "~/layouts/ModalScreen";
import { appState, useAppState } from "~/state/app-state";
import { useCameraState } from "~/state/camera-state";
import { useChallengeState } from "~/state/challenge-state";
import { useFaceState } from "~/state/face-state";
import { Spinner } from "~/ui/Spinner";

export function Screens() {
  const state = useAppState();
  const camera = useCameraState();
  const challenge = useChallengeState();
  const face = useFaceState();

  let screenContent: ReactNode = null;

  const loadedModels = face.modelsLoaded;

  if (!loadedModels) {
    screenContent = (
      <ModalScreen key="loadingModels">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
          }}
          transition={{ duration: 0.3 }}
          className="font-serif text-lg flex flex-col justify-center items-center gap-2"
        >
          <span>One moment...</span>
          <span className="text-[0.8em]">
            <Spinner />
          </span>
        </motion.div>
      </ModalScreen>
    );
    return (
      <AnimatePresence mode="wait" initial={true}>
        {screenContent}
      </AnimatePresence>
    );
  } else if (state.screen === "landing") {
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
