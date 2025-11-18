"use client";

import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

export function useDominantColor(
  imageUrl?: string | null,
  fallback: string = "#060b17"
) {
  const [color, setColor] = useState<string>(fallback);

  useEffect(() => {
    if (!imageUrl) {
      setColor(fallback);
      return;
    }

    let isCancelled = false;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(imageUrl, {
        mode: "speed",
        algorithm: "dominant",
        crossOrigin: "anonymous",
      })
      .then((result) => {
        if (!isCancelled && result?.hex) {
          setColor(result.hex);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setColor(fallback);
        }
      });

    return () => {
      isCancelled = true;
      fac.destroy();
    };
  }, [imageUrl, fallback]);

  return color;
}


