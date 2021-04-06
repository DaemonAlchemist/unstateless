import { pipe } from 'ts-functional';
import { useGlobal } from "./useGlobal";

export { inject } from "./inject";
export { Injector, IUseGlobalOptions, Setter, UpdateSpy } from "./types.d";
export { useGlobal } from './useGlobal';
export { useLocalStorage } from "./useLocalStorage";

export const useSharedState = useGlobal();
export const mergeProps = pipe;

