import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChallengeManager, useChallengeState } from "~/state/challenge-state";
import { FaceStateManager } from "~/state/face-state";
import { Tracking } from "~/utils/tracking";
import { Background } from "./Background";
import { MirrorContent } from "./MirrorContent";
import { Screens } from "./Screens";

export function App() {
  const state = useChallengeState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    Tracking.initialize();
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
