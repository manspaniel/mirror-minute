import type { ComponentProps } from "react";
import { tv } from "~/utils/tw";
import { Spinner } from "./Spinner";

type Props = ComponentProps<"button"> & {
  loading?: boolean;
  variant?: "default" | "dark" | "light";
};

export function Button({ loading, ...props }: Props) {
  const styles = buttonStyles({
    loading: loading ? true : false,
    variant: props.variant ?? "default",
  });

  return (
    <button {...props} className={styles.base({ className: props.className })}>
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
    "shadow-xl shadow-black/15 cursor-pointer transition-all ease-in-out duration-300",
    " lg:hover:scale-[1.02]",
    "active:translate-y-[0.2em] active:duration-75",
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
    variant: {
      default:
        "bg-indigo-500 text-white lg:hover:bg-indigo-600 active:bg-indigo-600",
      dark: "bg-indigo-950 text-white lg:hover:bg-indigo-900 active:bg-indigo-900",
      light:
        "bg-indigo-50 text-indigo-950 lg:hover:bg-indigo-100 active:bg-indigo-100",
    },
  },
  defaultVariants: {
    loading: false,
    variant: "default",
  },
});
