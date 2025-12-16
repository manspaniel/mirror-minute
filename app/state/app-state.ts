import { proxy, useSnapshot } from "valtio";

function createAppState() {
  const store = proxy({
    screen: "landing" as "landing" | "camera" | "challenge" | "complete",
    dismissLanding() {
      store.screen = "camera";
    },
    doneWithCamera() {
      store.screen = "challenge";
    },
    completeChallenge() {
      store.screen = "complete";
    },
  });

  return store;
}

export const appState = createAppState();

export function useAppState() {
  return useSnapshot(appState);
}
