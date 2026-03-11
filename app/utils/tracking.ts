//Import Mixpanel SDK
import mixpanel from "mixpanel-browser";
import { appState } from "~/state/app-state";

declare global {
  interface Window {
    MIXPANEL_INITIALIZED?: boolean;
    GA4_INITIALIZED?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

export namespace Tracking {
  export function initialize() {
    if (typeof window === "undefined") return;
    if (window.MIXPANEL_INITIALIZED && window.GA4_INITIALIZED) return;

    if (!window.MIXPANEL_INITIALIZED) {
      window.MIXPANEL_INITIALIZED = true;
      // Create an instance of the Mixpanel object, your token is already added to this snippet
      mixpanel.init("f011dd54b784e7b461723d67295e2d57", {
        debug: process.env.NODE_ENV === "development",
        track_pageview: true,
        persistence: "localStorage",
        cross_subdomain_cookie: true,
      });
    }

    if (!window.GA4_INITIALIZED) {
      // window.GA4_INITIALIZED = true;
      // window.dataLayer = window.dataLayer || [];
      // window.gtag = window.gtag || function gtag(...args: any[]) {
      //   window.dataLayer?.push(args);
      // };
      // const script = document.createElement("script");
      // script.async = true;
      // script.src = "https://www.googletagmanager.com/gtag/js?id=G-FES8YVFE2F";
      // document.head.appendChild(script);
      // window.gtag("js", new Date());
      // window.gtag("config", "G-FES8YVFE2F");
    }
  }

  export function trackEvent(label: string, properties?: Record<string, any>) {
    if (typeof window === "undefined") return;
    const eventProps = {
      ...properties,
      activeScreen: appState.screen,
    };

    mixpanel.track(label, eventProps);
    window.gtag?.("event", label, eventProps);
  }
}
