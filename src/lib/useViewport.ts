"use client";

import { useState, useEffect } from "react";

export interface ViewportInfo {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  /** มือถือ/แท็บเล็ต (กว้าง < 1024px = ต่ำกว่า lg ของ Tailwind) */
  isMobile: boolean;
  /** PC/desktop (กว้าง >= 1024px) */
  isDesktop: boolean;
}

/**
 * Hook ตรวจขนาดหน้าจอ + orientation แบบ real-time
 * (อัปเดตเมื่อ rotate หน้าจอ หรือ resize)
 */
export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    isPortrait: true,
    isLandscape: false,
    isMobile: false,
    isDesktop: true,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h >= w;
      const isMobile = w < 1024; // < Tailwind lg breakpoint

      setViewport({
        width: w,
        height: h,
        isPortrait,
        isLandscape: !isPortrait,
        isMobile,
        isDesktop: !isMobile,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return viewport;
}
