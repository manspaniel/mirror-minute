import { motion } from "motion/react";
import { useAppState } from "~/state/app-state";
import { Button } from "~/ui/Button";

export function FailureScreen() {
  const appState = useAppState();

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
        className="flex flex-col gap-5 text-center items-center"
      >
        <h3 className={"text-balance relative font-serif text-5xl"}>
          Challenge Failed
        </h3>
        <p className="font-serif text-lg">Are you ready to try again?</p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { delay: 0.2, duration: 1 },
          }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Button onClick={() => appState.doneWithCamera()}>Continue</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
