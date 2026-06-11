import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

/** Keep OS window background in sync with app theme. */
export function useSystemChrome(backgroundColor: string) {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(backgroundColor);
  }, [backgroundColor]);
}
