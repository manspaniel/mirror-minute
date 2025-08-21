import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

type Props = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export function Button(props: Props) {
  const styles = buttonStyles(props);

  return (
    <button {...props} className={styles}>
      {props.children}
    </button>
  );
}

const buttonStyles = tv({
  base: "inline-flex border border-black/5 backdrop-blur-md font-serif bg-white/50 hover:bg-white/60 text-lg shadow-lg rounded-full text-black px-5 py-1 items-center justify-center cursor-pointer transition-colors",
  variants: {},
});
