import { cn } from "~/utils/tw";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox(props: Props) {
  return (
    <div
      className={cn(
        "relative size-6 border border-indigo-300 rounded-md p-px flex items-center cursor-pointer transition-colors duration-200 text-indigo-500 flex-none",
        props.checked ? "border-indigo-500" : "bg-transparent",
      )}
    >
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        className="pointer-events-none opacity-0 absolute appearance-none outline-0"
      />
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          props.checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-[75%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    </div>
  );
}
