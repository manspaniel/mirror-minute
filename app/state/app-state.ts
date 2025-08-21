import { proxy, useSnapshot } from "valtio";

function createAppState() {
  const store = proxy({
    hasDismissedLanding: false,
    dismissLanding() {
      store.hasDismissedLanding = true;
    },
  });

  return store;
}

export const appState = createAppState();

export function useAppState() {
  return useSnapshot(appState);
}
