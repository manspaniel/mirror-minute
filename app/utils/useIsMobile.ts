import { useEffect, useState } from "react";

function getIsMobile() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth <= 768;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => getIsMobile());

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setIsMobile(getIsMobile());
    });
    ro.observe(document.body);

    return () => {
      ro.disconnect();
    };
  }, []);

  return isMobile;
}
