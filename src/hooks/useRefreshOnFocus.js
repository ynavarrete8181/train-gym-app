import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";

export function useRefreshOnFocus(scrollRef, refresh, options = {}) {
  const refreshRef = useRef(refresh);
  const isFirstFocusRef = useRef(true);
  const skipInitial = Boolean(options.skipInitial);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef?.current?.scrollTo?.({ y: 0, animated: false });
      });

      if (skipInitial && isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }

      isFirstFocusRef.current = false;
      refreshRef.current?.();
    }, [scrollRef, skipInitial])
  );
}
