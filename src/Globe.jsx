import { useEffect, useRef, useState } from "react";

export default function Globe({ fallback }) {
  const host = useRef(null);
  const scene = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const rotation = useRef(autoRotate);

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
            autoRotate: rotation.current,
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
    rotation.current = autoRotate;
    scene.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  return (
    <div
      className={`interactive-globe${failed ? " globe-failed" : ""}`}
      data-ready={ready}
    >
      {!ready && <div className="globe-fallback">{fallback}</div>}
      <div className="globe-canvas" ref={host} />
      {ready && (
        <div className="globe-controls">
          <span>Drag to rotate</span>
          <button
            type="button"
            aria-label={
              autoRotate ? "Pause globe rotation" : "Start globe rotation"
            }
            onClick={() => setAutoRotate((value) => !value)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {autoRotate ? (
                <path
                  d="M7 5v10M13 5v10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ) : (
                <path d="m7 4 9 6-9 6z" fill="currentColor" />
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
