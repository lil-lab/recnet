import { EffectCallback, useEffect } from "react";

// ref: https://github.com/streamich/react-use/blob/master/src/useEffectOnce.ts
const useEffectOnce = (effect: EffectCallback) => {
  // disable on-purpose, we want to run this effect only once when using this hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};

export default useEffectOnce;
