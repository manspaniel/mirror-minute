import { proxy, subscribe, useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { faceStore } from "./face-state";
import { useInterval } from "usehooks-ts";
import { useAppState } from "./app-state";
import { useCameraState } from "./camera-state";
import { useEffect } from "react";

const CHALLENGE_DURATION = 10 * 1000;

function createChallengeState() {
  const store = proxy({
    running: false,
    timeElapsed: 0,
    timeRemaining: 0,
    totalDuration: CHALLENGE_DURATION,
    invalidFor: 0,
    paused: false,
    faceCurrentlyCentered: false,
    holdStillFor: 3000,
    faceDirections: null as null | string,
    isActive: false,
  });

  subscribeKey(store, "faceCurrentlyCentered", () => {
    if (!store.running && !store.faceCurrentlyCentered) {
      store.holdStillFor = 3000;
    }
  });

  subscribeKey(store, "holdStillFor", () => {
    if (store.holdStillFor <= 0 && !store.running) {
      store.running = true;
    }
  });

  subscribeKey(store, "invalidFor", () => {
    if (store.invalidFor > 5000 && store.running) {
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
  const appState = useAppState();
  const cameraState = useCameraState();

  // const challengeScreenActive = appState.starting;

  // useEffect(() => {
  //   store.isActive = challengeScreenActive;
  // }, [challengeScreenActive]);

  useInterval(() => {
    const preparing = appState.screen === "challenge" && !store.running;
    if (!preparing) return;

    if (store.faceCurrentlyCentered && !store.paused) {
      store.holdStillFor -= 200;
    } else {
      store.holdStillFor = 3000;
    }
    if (store.running && store.faceCurrentlyCentered) {
      store.invalidFor += 200;
    } else {
      store.invalidFor = 0;
    }
  }, 200);

  useInterval(() => {
    if (store.running) {
      store.timeElapsed += 1000;
      store.timeRemaining = Math.ceil(store.totalDuration) - store.timeElapsed;
      if (store.timeRemaining <= 0 && store.timeElapsed > 1000) {
        store.running = false;
        appState.completeChallenge();
      }
    }
  }, 1000);

  return null;
}
