import { ViewTransition } from "react";

/**
 * A template rather than the layout: it remounts on every navigation, which is
 * what lets the page content play its enter and exit transitions. The styles
 * live in globals.css, next to the rule that keeps the header still.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
