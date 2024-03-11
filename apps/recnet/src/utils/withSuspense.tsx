import React, { ComponentType, Suspense, SuspenseProps } from "react";

// React Server Component HOC for Suspense
// ref: https://gist.github.com/emeraldsanto/43ae63eff64cafbab58d6e4d740deabf
export function withSuspense<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback: SuspenseProps["fallback"] = null
) {
  function ComponentWithSuspense(props: P) {
    return (
      <Suspense fallback={fallback}>
        <WrappedComponent {...props} />
      </Suspense>
    );
  }

  return ComponentWithSuspense;
}
