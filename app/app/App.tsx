import { useEffect, useState } from "react";
import { Background } from "./Background";
import { Screens } from "./Screens";

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="fixed inset-0">
      {ready && <Background />}
      <Screens />
    </div>
  );
}
