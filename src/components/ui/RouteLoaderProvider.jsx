"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FullScreenLoader from "./FullScreenLoader";

export default function RouteLoaderProvider({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Start loader on route change
    setLoading(true);

    // End loader after short timeout (simulate async)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600); // Adjust for realistic duration

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {loading && <FullScreenLoader />}
      {children}
    </>
  );
}
