import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * PageTransition — wraps route content and replays a soft fade+lift animation
 * whenever the URL pathname changes. CSS-driven (see page-transitions.css) so
 * no framer-motion dependency is added to the initial critical path.
 *
 * Chat is excluded because it owns its own message-level animation choreography
 * and a container-level cross-fade would fight it.
 */
const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      setKey(location.pathname);
    }
  }, [location.pathname]);

  // Skip the animation while inside the chat surface — it has its own.
  const skip = location.pathname.startsWith("/chat");

  return (
    <div key={key} className={skip ? undefined : "ng-page-enter"}>
      {children}
    </div>
  );
};

export default PageTransition;
