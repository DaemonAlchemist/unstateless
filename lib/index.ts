import { pipe } from 'ts-functional';
import { ISharedState } from './types.d';
import { addSharedState, initSharedState, useGlobal } from "./useGlobal";

export { inject } from "./inject";
export { Injector, IUseGlobalOptions, Setter, UpdateSpy } from "./types.d";
export { useDerivedState } from './useDerivedState';
export { useGlobal } from './useGlobal';
export { useLocalStorage } from "./useLocalStorage";

export const useSharedState = <T>(initialValue:T | string, i?:T | string):ISharedState<T> => {
    const {initial, index} = initSharedState<T>(initialValue, i);

    const f = addSharedState<T>(index, () => useGlobal<T>()(index, initial));
    return f;
}

export const mergeProps = pipe;

