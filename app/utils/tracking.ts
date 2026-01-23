//Import Mixpanel SDK
import mixpanel from "mixpanel-browser";
import { appState } from "~/state/app-state";

declare global {
  interface Window {
    MIXPANEL_INITIALIZED?: boolean;
  }
}

export namespace Tracking {
  export function initialize() {
    if (typeof window === "undefined") return;
    if (window.MIXPANEL_INITIALIZED) return;
    window.MIXPANEL_INITIALIZED = true;
    // Create an instance of the Mixpanel object, your token is already added to this snippet
    mixpanel.init("f011dd54b784e7b461723d67295e2d57", {
      debug: process.env.NODE_ENV === "development",
      track_pageview: true,
      persistence: "localStorage",
      cross_subdomain_cookie: true,
    });
  }

  export function trackEvent(label: string, properties?: Record<string, any>) {
    if (typeof window === "undefined") return;
    mixpanel.track(label, {
      ...properties,
      activeScreen: appState.screen,
    });
  }
}
