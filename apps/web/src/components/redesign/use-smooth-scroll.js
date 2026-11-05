"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function useSmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const root = document.documentElement;
    const previousPadding = root.style.scrollPaddingTop;
    root.style.scrollPaddingTop = "110px";
    let scroll;
    function update() {
      scroll?.destroy();
      scroll = undefined;
      // Touch and reduced motion keep the browser's native scrolling.
      if (reduced.matches || !pointer.matches) return;
      scroll = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.12,
        anchors: true,
        stopInertiaOnNavigate: true,
        prevent: (node) =>
          document.body.hasAttribute("data-scroll-locked") ||
          Boolean(
            node.closest(
              '[role="dialog"], [data-lenis-prevent], textarea, select',
            ),
          ),
      });
    }
    update();
    reduced.addEventListener("change", update);
    pointer.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
      scroll?.destroy();
      root.style.scrollPaddingTop = previousPadding;
    };
  }, []);
}
