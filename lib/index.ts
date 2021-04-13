import { pipe } from 'ts-functional';
import { useGlobal } from "./useGlobal";

export { inject } from "./inject";
export { Injector, IUseGlobalOptions, Setter, UpdateSpy } from "./types.d";
export { useGlobal } from './useGlobal';
export { useLocalStorage } from "./useLocalStorage";

export const useSharedState = <T>(index: string, initialValue:T) => useGlobal<T>()(index, initialValue);
export const mergeProps = pipe;

