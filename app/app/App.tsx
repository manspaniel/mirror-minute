import { useEffect, useState } from "react";
import { Background } from "./Background";
import { Screens } from "./Screens";
import { MirrorContent } from "./MirrorContent";
import { ChallengeManager } from "~/state/challenge-state";

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <ChallengeManager />
      <div className="fixed inset-0">
        {ready && <Background />}
        {ready && <MirrorContent />}
        <Screens />
      </div>
    </>
  );
}
