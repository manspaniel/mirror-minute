import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useAppState } from "~/state/app-state";
import { useCameraState } from "~/state/camera-state";
import { challengeState, useChallengeState } from "~/state/challenge-state";
import { useFaceState } from "~/state/face-state";
import { shareStore } from "~/state/share-state";
import { useEscape } from "~/utils/useEscape";

export function MirrorContent() {
  return (
    <div className="absolute inset-0 pointer-events-none font-sans">
      <ChallengeOverlay />
    </div>
  );
}

const AFFIRMATIONS = [
  {
    text: "What’s coming to mind when you look at yourself?",
    at: 5000,
    duration: 5000,
  },
  {
    text: "You’re halfway! Keep going...",
    at: 30000,
    duration: 5000,
  },
  {
    text: "Almost there!",
    at: 50000,
    duration: 3000,
  },
];

export function ChallengeOverlay() {
  const faceState = useFaceState();
  const challenge = useChallengeState();
  const appState = useAppState();
  const cameraState = useCameraState();

  useEscape(() => {
    if (challengeState.running) {
      challengeState.timeElapsed = challenge.totalDuration;
    }
  });

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (appState.screen === "challenge") {
      const timer = setTimeout(() => {
        setEnabled(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setEnabled(false);
    }
  }, [appState.screen === "challenge"]);

  const [affirmation, setAffirmation] = useState<null | {
    text: string;
    at: number;
    duration: number;
  }>(null);

  // Update affirmation based on timeElapsed
  useEffect(() => {
    if (!challenge.running) {
      setAffirmation(null);
      return;
    }

    const currentAffirmation = AFFIRMATIONS.find((aff) => {
      const showStart = aff.at;
      const showEnd = aff.at + aff.duration;
      return (
        challenge.timeElapsed >= showStart && challenge.timeElapsed < showEnd
      );
    });

    setAffirmation(currentAffirmation || null);
  }, [challenge.running, challenge.timeElapsed]);

  let warningMessage = "";
  let warningNotes = "";

  if (appState.screen === "challenge" && enabled) {
    if (faceState.faceWarnings.includes("noface")) {
      warningMessage = "We can't see your face";
      warningNotes =
        "Make sure your face is in the camera view, and that you're in a well-lit area.";
    } else if (faceState.faceWarnings.includes("position")) {
      warningMessage = "Centre yourself";
      warningNotes =
        "Centre your face within the circle and ensure your whole face is visible.";
    } else if (faceState.faceWarnings.includes("angle")) {
      warningMessage = "Please face the camera";
      warningNotes = "Try to face the camera more directly.";
    } else if (faceState.faceWarnings.includes("zoom")) {
      warningMessage = "Your face isn't fully visible";
    }
  }

  let label = null as ReactNode;
  let instructions = "";
  let challengeDisplay = null as ReactNode;
  let finalSeconds = "" as string;

  if (warningMessage) {
    label = <div>{warningMessage}</div>;
    instructions = warningNotes;
  } else if (
    !challenge.running &&
    challenge.holdStillFor > 0 &&
    challenge.faceCurrentlyCentered &&
    appState.screen === "challenge" &&
    enabled
  ) {
    label = (
      <div className="tabular-nums">
        Hold still for {Math.ceil(challenge.holdStillFor / 1000)} seconds
      </div>
    );
  } else if (affirmation && challenge.running && enabled) {
    // Show affirmation when there are no warnings
    label = <div>{affirmation.text}</div>;
  }

  if (challenge.running && enabled) {
    const remaining = Math.max(0, challenge.timeRemaining);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    if (remaining > 0) {
      challengeDisplay = (
        <motion.div
          variants={{
            running: { scale: 1, opacity: 1, filter: "none" },
            paused: { scale: 1, opacity: 0.8, filter: "blur(2px)" },
          }}
          animate={challenge.paused ? "paused" : "running"}
          className="text-white font-sans text-4xl md:text-6xl tracking-wider leading-[0.8]"
        >
          {`${minutes}:${seconds.toString().padStart(2, "0")}`}
        </motion.div>
      );
    }
    if (remaining <= 3000 && remaining > 0) {
      finalSeconds = Math.ceil(remaining / 1000).toString();
      challengeDisplay = null;
    }
  }

  return (
    <>
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          width: faceState.faceBoxSize.width,
          height: faceState.faceBoxSize.height,
        }}
      >
        <motion.div
          animate={{
            opacity:
              faceState.hasFace && (!!label || !challenge.running) ? 1 : 0,
          }}
          className="absolute inset-0 rounded-full"
        ></motion.div>

        {/* Label */}
        <AnimatePresence mode="wait">
          {!!label && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={warningMessage}
              transition={{ duration: 0.2 }}
              className="absolute top-full pt-8 left-1/2 w-[90vw] -translate-x-1/2 text-center font-sans max-md:text-lg text-2xl text-white uppercase"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Extra instructions */}
      <div className="fixed bottom-4 md:bottom-8 left-2 right-2 text-center text-lg font-serif text-white leading-[1.4]">
        <AnimatePresence mode="wait" propagate>
          {instructions && (
            <motion.div
              key={instructions}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:whitespace-pre-wrap"
            >
              {instructions}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Countdown */}
      <div className="absolute top-0 left-0 flex items-center justify-center text-center flex-col gap-2 p-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {challengeDisplay ? (
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.8 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 0.8 }}
            >
              {challengeDisplay}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Final countdown */}
      <div className="absolute inset-0 flex items-center justify-center text-center flex-col gap-2 p-8 pointer-events-none text-white text-4xl md:text-7xl">
        <AnimatePresence mode="popLayout">
          {finalSeconds ? (
            <motion.div
              initial={{ opacity: 0, filter: "blur(0px)", scale: 0.0 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.2 }}
              transition={{ duration: 0.3 }}
              key={finalSeconds}
            >
              {finalSeconds}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
