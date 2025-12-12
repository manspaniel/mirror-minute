import type { ComponentProps } from "react";
import { tv } from "~/utils/tw";
import { Spinner } from "./Spinner";

type Props = ComponentProps<"button"> & {
  loading?: boolean;
};

export function Button(props: Props) {
  const styles = buttonStyles({
    loading: props.loading ? true : false,
  });

  return (
    <button {...props} className={styles.base()}>
      <span className={styles.label()}>{props.children}</span>
      <span className={styles.spinner()}>
        <Spinner />
      </span>
    </button>
  );
}

export const buttonStyles = tv({
  base: [
    "group/button",
    "inline-flex rounded-full px-10 py-3 items-center justify-center relative",
    "font-sans uppercase text-[12px] leading-tight tracking-wider",
    "bg-indigo-500 text-white shadow-xl shadow-black/15 cursor-pointer transition-all ease-in-out duration-300",
    "lg:hover:bg-indigo-600 lg:hover:scale-[1.02]",
    "active:translate-y-[0.2em] active:bg-indigo-600 active:duration-75",
  ],
  slots: {
    label:
      "pointer-events-none select-none lg:group-hover/button:scale-[0.99] transition-all ease-in-out duration-300 scale-100",
    spinner:
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-75 transition-all ease-in-out duration-300",
  },
  variants: {
    loading: {
      true: {
        label: "opacity-0 scale-75",
        spinner: "opacity-100 scale-100",
      },
    },
  },
});
