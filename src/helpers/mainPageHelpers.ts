import { RefObject } from "react";

export const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const resetInterval = (interval: RefObject<NodeJS.Timeout | null>) => {
  if (interval.current) {
    clearInterval(interval.current);
    interval.current = null;
  }
}