import { App } from "~/app/App";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mirror Minute ⬩ Laugh Lines" },
    {
      name: "description",
      content:
        "For one minute, there's nothing to fix, perform or hide from. This mirror doesn’t want your good side —it wants your honesty.",
    },
  ];
}

export default function Home() {
  return (
    <div>
      <App />
    </div>
  );
}
