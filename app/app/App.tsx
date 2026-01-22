import { useEffect, useState } from "react";
import { Background } from "./Background";
import { Screens } from "./Screens";
import { MirrorContent } from "./MirrorContent";
import { ChallengeManager, useChallengeState } from "~/state/challenge-state";
import { FaceStateManager } from "~/state/face-state";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "~/state/app-state";

export function App() {
  const state = useChallengeState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <ChallengeManager />
      <FaceStateManager />
      <div className="fixed inset-0">
        <AnimatePresence>
          {ready && !state.completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg"
            >
              {ready && <Background />}
              {ready && <MirrorContent />}
            </motion.div>
          )}
        </AnimatePresence>
        <Screens />
      </div>
    </>
  );
}
