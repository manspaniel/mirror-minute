import { useAppState } from "~/state/app-state";
import { useSplashScreen } from "~/state/states";
import { Button } from "~/ui/Button";

export function LandingContent() {
  const app = useAppState();
  return (
    <div className="flex flex-col gap-5 items-center text-center">
      <h3 className="text-4xl text-balance">
        Can you face yourself for 60 seconds?
      </h3>
      <div className="flex items-center">
        <Button className="flex-1" onClick={() => app.dismissLanding()}>
          Yes, I can
        </Button>
      </div>
    </div>
  );
}
