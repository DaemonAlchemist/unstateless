import { Guid } from 'guid-typescript';
import * as React from 'react';
import { useSyncExternalStore } from 'react';
import * as StackTrace from 'stacktrace-js';
import { memoize } from 'ts-functional';
import { Func } from 'ts-functional/dist/types';
import { ISharedState, IUseGlobalOptions, Setter, UpdateSpy } from './types';

// Record all components who are subscribed to specific global states
const subscribers:{[index:string]: Set<() => void>} = {};
const getSubscribers = (index:string) => {
    if(!subscribers[index]) {
        subscribers[index] = new Set<() => void>();
    }
    return subscribers[index];
}

// Record all spies that are listening to state changes
const spies:{[index:string]: Set<UpdateSpy<any>>} = {};
const globalSpies:Set<UpdateSpy<any>> = new Set<UpdateSpy<any>>();
const callListeners = (newVal:any, oldVal:any, index:string) => {
    (spies[index] || []).forEach(spy => {spy(newVal, oldVal, index);});
    globalSpies.forEach(spy => {spy(newVal, oldVal, index);});
}

// Record the last values for all state.  We need this in case the index for a hook changes,
// and we need to manually reset the state
export const curValues:{[index:string]:any} = {};
const setCurValue = (index:string, obj:any) => {
    curValues[index] = obj;
}

const updateSubscribers = memoize(<T>(index: string) => (newValOrSetter:T | Func<T, T>) => {
    // Convert the new value into a setter function if it's a raw value
    const updateVal:Func<T, T> = typeof newValOrSetter === 'function'
        ? newValOrSetter as Func<T, T>
        : ():T => newValOrSetter;
    
    // Calculate the new value
    const oldVal = curValues[index];
    const newVal = updateVal(oldVal);

    if(newVal !== oldVal) {
        setCurValue(index, newVal);
        callListeners(newVal, oldVal, index);
        
        // Notify subscribers
        getSubscribers(index).forEach((callback) => {callback();});
    }

    // Return the new value
    return newVal;
}, {});

const subscribe = (index:string) => (onStoreChange: () => void) => {
    const subs = getSubscribers(index);
    subs.add(onStoreChange);
    return () => {
        subs.delete(onStoreChange);
    };
}

const getSnapshot = (index:string) => () => {
    return curValues[index];
}

const useGlobalRaw = <T>(options?:IUseGlobalOptions<T>) =>
    (index: string, initialValue:T):[T, Setter<T>, (newVal:T) => () => void] => {
        
        // Initialize if not already initialized
        // This logic needs to run before useSyncExternalStore to ensure the value exists
        if(typeof curValues[index] === "undefined") {
            const initial = !!options && !!options.loadInitialValue
                ? (options.loadInitialValue as (index:string, i:T) => T)(index, initialValue)
                : initialValue;
            setCurValue(index, initial);
            callListeners(initial, initial, index);
        }

        const val = useSyncExternalStore(subscribe(index), getSnapshot(index));
        const set = updateSubscribers<T>(index);
        const update = memoize(s => memoize((newVal:T) => () => {s(newVal);}, {}), {})(set);

        return [val, set, update];
    }

useGlobalRaw.listen = {
    on: <T>(state:ISharedState<T>, spy:UpdateSpy<T>) => {
        const i = state.__index__;
        if(!spies[i]) {
            spies[i] = new Set<UpdateSpy<T>>();
        }
        spies[i].add(spy);
        if(typeof curValues[i] !== "undefined") {
            spy(curValues[i], curValues[i], i);
        }
    },
    onAll: <T>(spy:UpdateSpy<T>) => {
        globalSpies.add(spy);
        Object.keys(curValues).forEach(index => {
            spy(curValues[index], curValues[index], index);
        });
    },
    off: <T>(state:ISharedState<T>, spy:UpdateSpy<T>) => {
        spies[state.__index__].delete(spy);
    },
    offAll: <T>(spy:UpdateSpy<T>) => {
        globalSpies.delete(spy);
    },
    clear: <T>(state:ISharedState<T>) => {
        spies[state.__index__].clear();
    },
    clearAll: () => {
        Object.keys(spies).forEach(index => {
            spies[index].clear();
        });
        globalSpies.clear();
    }
}

useGlobalRaw.clear = (index:string) => {
    delete curValues[index];
}

useGlobalRaw.clearAll = () => {
    Object.keys(curValues).forEach(useGlobalRaw.clear);
}


export const addSharedState = <T>(index:string, f:any):ISharedState<T> => {
    f.__index__ = index;
    f.onChange = (spy:UpdateSpy<T>) => {useGlobal.listen.on(f, spy);}
    f.offChange = (spy:UpdateSpy<T>) => {useGlobal.listen.off(f, spy);}
    f.clearListeners = () => {useGlobal.listen.clear(f);}
    f.getValue = () => curValues[index];
    f.setValue = (newValue:T) => updateSubscribers(index)(newValue);
    return f;
}

export const indexErrorMessage = "Unstateless error:  An index is required when using useSharedState directly inside a component.";
export const initSharedState = <T>(initialValue:T | string, i?:T | string):{initial:T, index:string} => {
    // If a custom hook is being defined inline within a component, it MUST have an index.
    // Throw an error otherwise.
    const isRendering = StackTrace.getSync().filter(s => s.functionName === "renderWithHooks").length > 0;
    if(isRendering && typeof i === "undefined") {
        throw indexErrorMessage;
    }

    const definedIndex = typeof i !== 'undefined';
    const initial:T    = (definedIndex ? i : initialValue) as T;
    const index:string = (definedIndex ? initialValue : Guid.create().toString()) as string;
    return {initial, index};
} 

export const useGlobal = useGlobalRaw;
