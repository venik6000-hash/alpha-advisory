import { useLanguage } from "./Language.jsx";
import { useEffect, useRef, useState } from "react";

export default function Globe({ fallback }) {
  const { t, language } = useLanguage();
  const host = useRef(null);
  const scene = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  useEffect(() => {
    let cancelled = false;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const { createGlobe } = await import("./globeScene.js");
          if (cancelled) return;
          scene.current = createGlobe(host.current, {
            autoRotate,
            onReady: () => setReady(true),
            onFailure: () => {
              setReady(false);
              setFailed(true);
            },
          });
        } catch {
          if (!cancelled) setFailed(true);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(host.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = host.current?.querySelector("canvas");
    canvas?.setAttribute(
      "aria-label",
      t(
        "Interactive Earth globe with a pin marking Tbilisi, Georgia. Drag to rotate, or use the arrow keys. Press Home to reset.",
      ),
    );
    const label = host.current?.querySelector(".globe-label");
    if (label) label.textContent = t("Georgia");
  }, [language, ready]);

  return (
    <div
      className={`interactive-globe${failed ? " globe-failed" : ""}`}
      data-ready={ready}
    >
      {!ready && <div className="globe-fallback">{fallback}</div>}
      <div className="globe-canvas" ref={host} />
    </div>
  );
}
