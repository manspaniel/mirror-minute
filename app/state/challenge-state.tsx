import { useInterval } from "usehooks-ts";
import { proxy, subscribe, useSnapshot } from "valtio";
import { subscribeKey } from "valtio/utils";
import { appState, useAppState } from "./app-state";
import { useCameraState } from "./camera-state";
import { faceStore } from "./face-state";
import { Tracking } from "~/utils/tracking";

const CHALLENGE_DURATION = 20 * 1000;
const HOLD_STILL_DURATION = 3 * 1000;

function createChallengeState() {
  const store = proxy({
    running: false,
    timeElapsed: 0,
    timeRemaining: 0,
    timeInvalid: 0,
    totalDuration: CHALLENGE_DURATION,
    invalidFor: 0,
    paused: false,
    faceCurrentlyCentered: false,
    holdStillFor: HOLD_STILL_DURATION,
    faceDirections: null as null | string,
    cumulativeInvalidTime: 0,
    isActive: false,
    completed: false,
  });

  function resetDueToFailure() {
    const percentInvalid =
      (store.cumulativeInvalidTime / store.totalDuration) * 100;
    Tracking.trackEvent("Challenge - Failed", {
      timeElapsed: store.timeElapsed,
      percentInvalid: Math.round(percentInvalid),
    });
    store.running = false;
    store.timeElapsed = 0;
    store.timeRemaining = Math.ceil(store.totalDuration);
    store.timeInvalid = 0;
    store.invalidFor = 0;
    store.paused = false;
    store.faceCurrentlyCentered = false;
    store.holdStillFor = HOLD_STILL_DURATION;
    store.completed = false;
    appState.failChallenge();
  }

  subscribeKey(store, "faceCurrentlyCentered", () => {
    if (!store.running && !store.faceCurrentlyCentered) {
      store.holdStillFor = HOLD_STILL_DURATION;
    }
  });

  subscribeKey(store, "holdStillFor", () => {
    if (store.holdStillFor <= 0 && !store.running) {
      Tracking.trackEvent("Challenge - Started");
      store.running = true;
    }
  });

  subscribeKey(store, "invalidFor", () => {
    if (
      store.running &&
      store.invalidFor > 2000 &&
      store.running &&
      !store.completed
    ) {
      if (!store.paused) {
        Tracking.trackEvent("Challenge - Paused", {
          timeElapsed: store.timeElapsed,
        });
      }
      store.paused = true;
    } else {
      if (store.paused) {
        Tracking.trackEvent("Challenge - Resumed", {
          timeElapsed: store.timeElapsed,
        });
      }
      store.paused = false;
    }
  });

  subscribeKey(store, "timeInvalid", () => {
    if (
      store.running &&
      store.timeInvalid > CHALLENGE_DURATION * 0.3 &&
      store.running
    ) {
      resetDueToFailure();
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
    // Manage invalidFor tracking
    if (appState.screen === "challenge" && store.running) {
      if (store.running && !store.faceCurrentlyCentered) {
        store.invalidFor += 200;
        store.timeInvalid += 200;
        store.cumulativeInvalidTime += 200;
      } else {
        store.invalidFor = 0;
      }
    }

    // Manage 'hold still' countdown
    if (appState.screen === "challenge" && !store.running) {
      if (store.faceCurrentlyCentered && !store.paused) {
        store.holdStillFor -= 200;
      } else {
        store.holdStillFor = HOLD_STILL_DURATION;
        store.cumulativeInvalidTime += 200;
      }
    }
  }, 200);

  useInterval(() => {
    if (store.running && !store.paused) {
      store.timeElapsed += 1000;
      store.timeRemaining = Math.ceil(store.totalDuration) - store.timeElapsed;
      if (store.timeRemaining <= 0 && store.timeElapsed > 1000) {
        const percentInvalid =
          (store.cumulativeInvalidTime / store.totalDuration) * 100;
        Tracking.trackEvent("Challenge - Completed", {
          percentInvalid: Math.round(percentInvalid),
        });
        store.running = false;
        store.completed = true;
        appState.completeChallenge();
      }
    }
  }, 1000);

  return null;
}
