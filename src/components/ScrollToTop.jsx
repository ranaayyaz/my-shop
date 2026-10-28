import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Har page change par scroll wapas sab se upar le jata hai
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
