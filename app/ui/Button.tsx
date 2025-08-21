import type { ComponentProps } from "react";

type Props = ComponentProps<"button">;

export function Button(props: Props) {
  return (
    <button
      {...props}
      className="inline-flex border border-black/5 backdrop-blur-md font-serif bg-white/50 hover:bg-white/60 text-lg shadow-lg rounded-full text-black px-5 py-1 items-center justify-center cursor-pointer transition-colors"
    >
      {props.children}
    </button>
  );
}
