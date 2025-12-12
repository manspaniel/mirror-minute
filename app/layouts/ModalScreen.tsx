import { motion } from "motion/react";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export function ModalScreen(props: Props) {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center perspective-[1000px] text-black">
      {props.children}
    </motion.div>
  );
}
