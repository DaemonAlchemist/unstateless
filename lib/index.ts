import { Guid } from 'guid-typescript';
import * as StackTrace from 'stacktrace-js';
import { pipe } from 'ts-functional';
import { ISharedState, ISharedStateFunction } from './types.d';
import { useGlobal } from "./useGlobal";

export { inject } from "./inject";
export { Injector, IUseGlobalOptions, Setter, UpdateSpy } from "./types.d";
export { useDerivedState } from './useDerivedState';
export { useGlobal } from './useGlobal';
export { useLocalStorage } from "./useLocalStorage";

export const indexErrorMessage = "Unstateless error:  An index is required when using useSharedState directly inside a component.";

export const useSharedState = <T>(initialValue:T | string, i?:T | string):ISharedState<T> => {
    const isRendering = StackTrace.getSync().filter(s => s.functionName === "renderWithHooks").length > 0;
    if(isRendering && !i) {
        throw indexErrorMessage;
    }

    const initial:T = (!!i ? i : initialValue) as T;
    const index:string = (!!i ? initialValue : Guid.create().toString()) as string;
    const f = () => useGlobal<T>()(index, initial);
    f.__index__ = index;
    return f;
}

export const mergeProps = pipe;

