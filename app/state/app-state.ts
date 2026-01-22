import { proxy, useSnapshot } from "valtio";

function createAppState() {
  const store = proxy({
    screen: "landing" as
      | "landing"
      | "camera"
      | "challenge"
      | "failure"
      | "complete"
      | "summary"
      | "share",
    dismissLanding() {
      store.screen = "camera";
    },
    doneWithCamera() {
      store.screen = "challenge";
    },
    failChallenge() {
      store.screen = "failure";
    },
    completeChallenge() {
      store.screen = "complete";
    },
    dismissCompletion() {
      store.screen = "summary";
    },
    openShare() {
      store.screen = "share";
    },
    closeShare() {
      store.screen = "summary";
    },
  });

  return store;
}

export const appState = createAppState();

export function useAppState() {
  return useSnapshot(appState);
}
