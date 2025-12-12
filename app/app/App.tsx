import { useEffect, useState } from "react";
import { Background } from "./Background";
import { Screens } from "./Screens";
import { MirrorContent } from "./MirrorContent";
import { ChallengeManager } from "~/state/challenge-state";
import { FaceStateManager } from "~/state/face-state";

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <ChallengeManager />
      <FaceStateManager />
      <div className="fixed inset-0">
        {ready && <Background />}
        {ready && <MirrorContent />}
        <Screens />
      </div>
    </>
  );
}
