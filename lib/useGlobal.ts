import * as React from 'react';
import { memoize } from 'ts-functional';
import { Func } from 'ts-functional/dist/types';
import { ISharedState, IUseGlobalOptions, Setter, UpdateSpy } from './types';

// Record all components who are subscribed to specific global states
const subscribers:{[index:string]: Set<Func<any, void>>} = {};
const getSubscribers = (index:string) => {
    if(!subscribers[index]) {
        subscribers[index] = new Set<(val:any) => void>();
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

const updateSubscribers = <T>(index: string) => (newValOrSetter:T | Func<T, T>) => {
    // Convert the new value into a setter function if it's a raw value
    const updateVal:Func<T, T> = typeof newValOrSetter === 'function'
        ? newValOrSetter as Func<T, T>
        : ():T => newValOrSetter;
    
    // We need to wrap the setter function before sending it to the subscribers, so 
    // that the value can updated (if needed) after it's generated.  The wrapper function is
    // memoized, so that the new value is only calculated and updated once.
    const newSetter = memoize((old:T) => {
        // Update and save the value
        const newVal = updateVal(old);

        if(newVal !== old) {
            setCurValue(index, newVal);
            callListeners(newVal, old, index);
        }

        // Return the new value
        return newVal;
    }, {});

    // Update the subscribers if there are any
    getSubscribers(index).forEach((setter) => {setter(newSetter);});
}

const manageSubscribers = <T>(index: string, get:Func<void, T>, setVal:React.Dispatch<React.SetStateAction<T>>) => {
    React.useEffect(() => {
        const subs = getSubscribers(index);
        subs.add(setVal);
        if(curValues[index]) {setVal(curValues[index]);}
        return () => {
            subs.delete(setVal);
        }        
    }, [index, get, setVal]);
}

const useGlobalRaw = <T>(options?:IUseGlobalOptions<T>) =>
    (index: string, initialValue:T):[T, Setter<T>] => {
        const get = () => {
            const initial = !!options && !!options.loadInitialValue
                ? (options.loadInitialValue as (index:string, i:T) => T)(index, initialValue)
                : initialValue;
            if(typeof curValues[index] === "undefined") {
                setCurValue(index, initial);
                callListeners(initial, initial, index);
            }
            return initial;
        }

        const [curIndex, setCurIndex] = React.useState(index);
        const [val, setVal] = React.useState<T>(get);
        manageSubscribers<T>(index, get, setVal);

        const set = updateSubscribers<T>(index);

        // If the index of this hook changes, we need to manually update the current state based on the last saved value
        React.useEffect(() => {
            if(curIndex !== index) {
                setCurIndex(index);
                set(curValues[index] || get());
            }
        }, [index]);

        return [val, set];
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

export const useGlobal = useGlobalRaw;
