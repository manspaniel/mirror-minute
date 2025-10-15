import { proxy, subscribe, useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { faceStore } from "./face-state";
import { useInterval } from "usehooks-ts";

const CHALLENGE_DURATION = 60 * 1000;

function createChallengeState() {
  const store = proxy({
    started: false,
    timeElapsed: 0,
    timeRemaining: 0,
    totalDuration: CHALLENGE_DURATION,
    invalidFor: 0,
    paused: false,
    faceCurrentlyCentered: false,
    holdStillFor: 3000,
    faceDirections: null as null | string,
  });

  subscribeKey(store, "faceCurrentlyCentered", () => {
    if (!store.started && !store.faceCurrentlyCentered) {
      store.holdStillFor = 3000;
    }
  });

  subscribeKey(store, "holdStillFor", () => {
    if (store.holdStillFor <= 0 && !store.started) {
      store.started = true;
    }
  });

  subscribeKey(store, "invalidFor", () => {
    if (store.invalidFor > 5000 && store.started) {
      store.paused = true;
    } else {
      store.paused = false;
    }
  });

  subscribe(faceStore, () => {
    store.faceCurrentlyCentered =
      faceStore.faceWarnings.length === 0 && faceStore.hasFace;
  });

  return store;
}

export const challengeState = createChallengeState();

export function useChallengeState() {
  return useSnapshot(challengeState);
}

export function ChallengeManager() {
  const store = challengeState;

  useInterval(() => {
    if (store.faceCurrentlyCentered && !store.paused) {
      store.holdStillFor -= 200;
    } else {
      store.holdStillFor = 3000;
    }
    if (store.started && store.faceCurrentlyCentered) {
      store.invalidFor += 200;
    } else {
      store.invalidFor = 0;
    }
  }, 200);

  useInterval(() => {
    if (store.started) {
      store.timeElapsed += 1000;
      store.timeRemaining = Math.ceil(store.totalDuration) - store.timeElapsed;
    }
  }, 1000);

  return null;
}
