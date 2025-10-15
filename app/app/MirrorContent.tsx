import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useChallengeState } from "~/state/challenge-state";
import { useFaceState } from "~/state/face-state";

export function MirrorContent() {
  return (
    <div className="absolute inset-0 pointer-events-none font-sans">
      <ChallengeOverlay />
    </div>
  );
}

export function ChallengeOverlay() {
  const faceState = useFaceState();
  const challenge = useChallengeState();

  let warningMessage = "";
  let warningNotes = "";

  if (faceState.faceWarnings.includes("noface")) {
    warningMessage = "We can't see your face";
    warningNotes =
      "Make sure your face is in the camera view, and that you're in a well-lit area.";
  } else if (faceState.faceWarnings.includes("position")) {
    warningMessage = "Please center your face within the circle";
  } else if (faceState.faceWarnings.includes("angle")) {
    warningMessage = "Please face the camera";
    warningNotes = "Try to face the camera more directly.";
  } else if (faceState.faceWarnings.includes("zoom")) {
    warningMessage = "Your face isn't fully visible";
  }

  let faceNotes = null as ReactNode;
  let challengeDisplay = null as ReactNode;

  if (warningMessage) {
    faceNotes = <div className="text-red-600">{warningMessage}</div>;
  } else if (
    !challenge.started &&
    challenge.holdStillFor > 0 &&
    challenge.faceCurrentlyCentered
  ) {
    faceNotes = (
      <div>
        Hold still for {Math.ceil(challenge.holdStillFor / 1000)} seconds
      </div>
    );
  }
  if (challenge.started) {
    challengeDisplay = (
      <div className="text-green-600">
        Challenge started {challenge.timeElapsed / 1000} /{" "}
        {challenge.totalDuration / 1000} seconds
      </div>
    );
  }

  return (
    <>
      <motion.div className="absolute top-1/2 left-1/2 w-[min(50vw,50vh)] h-[min(50vw,50vh)] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            opacity:
              faceState.hasFace && (!!faceNotes || !challenge.started) ? 1 : 0,
          }}
          className="absolute inset-0 border-4 border-white border-dashed rounded-full"
        ></motion.div>
        <AnimatePresence mode="wait">
          {!!faceNotes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={warningMessage}
              className="absolute top-full pt-4 -left-10 -right-10 text-center"
            >
              {faceNotes}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="absolute top-0 left-0 right-0 flex p-4 items-center justify-center text-center flex-col gap-2">
        {challengeDisplay}
      </div>
    </>
  );
}
