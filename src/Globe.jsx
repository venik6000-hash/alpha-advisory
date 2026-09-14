import { useEffect, useRef, useState } from "react";

export default function Globe({ fallback }) {
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
