import React, { ComponentType, Suspense, SuspenseProps } from "react";

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
