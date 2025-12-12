import { App } from "~/app/App";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mirror Minute" }, { name: "description", content: "" }];
}

export default function Home() {
  return (
    <div>
      <App />
    </div>
  );
}
