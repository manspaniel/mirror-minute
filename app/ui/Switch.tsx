import { cn } from "~/utils/tw";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Switch(props: Props) {
  return (
    <div
      className={cn(
        "w-12 h-6 border border-indigo-300 rounded-full p-px flex items-center cursor-pointer transition-colors duration-300",
        props.checked ? "border-indigo-500 bg-indigo-500" : "bg-transparent"
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
          "aspect-square h-full bg-white rounded-full transition-all duration-300",
          props.checked
            ? "translate-x-6 bg-indigo-50"
            : "translate-x-0 bg-indigo-500"
        )}
      ></div>
    </div>
  );
}
