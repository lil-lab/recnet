"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";

export const HistoryContext = createContext<boolean>(false);

export function useHistory() {
  return useContext(HistoryContext);
}

// ref: https://stackoverflow.com/a/76729584
export function HistoryProvider({ children }: React.PropsWithChildren) {
  const [isWithinPage, setIsWithinPage] = useState(false);
  const pathname = usePathname();
  const [originalUrl, _] = useState<string>(pathname);

  // track if the url has changed here (check link)
  useEffect(() => {
    if (pathname !== originalUrl) {
      setIsWithinPage(true);
    }
  }, [pathname, originalUrl]);

  return (
    <HistoryContext.Provider value={isWithinPage}>
      {children}
    </HistoryContext.Provider>
  );
}
