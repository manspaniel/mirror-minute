import { motion } from "motion/react";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export function ModalScreen(props: Props) {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center perspective-[1000px] text-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, rotateX: "10deg", y: "20px" }}
        animate={{ opacity: 1, scale: 1, rotateX: "0" }}
        exit={{ opacity: 0, scale: 0.95, rotateX: "0", y: "0px" }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
        className="w-[90vw] max-w-[500px] will-change-transform"
      >
        {props.children}
      </motion.div>
    </motion.div>
  );
}
