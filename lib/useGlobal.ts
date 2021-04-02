import * as React from 'react';
import { memoize } from 'ts-functional';
import { Func } from 'ts-functional/dist/types';
import { IUseGlobalOptions } from './types';

const subscribers:{[index:string]: Set<Func<any, void>>} = {};

const updateSubscribers = <T>(index: string, onUpdate?: (index:string, newValue:T) => void) => (newValOrSetter:T | Func<T, T>) => {
    // Convert the new value into a setter function if it's a raw value
    const updateVal:Func<T, T> = typeof newValOrSetter === 'function'
        ? newValOrSetter as Func<T, T>
        : ():T => newValOrSetter;
    
    // We need to wrap the setter function before sending it to the subscribers, so 
    // that the value can updated (if needed) after it's generated.  The wrapper function is
    // memoized, so that the new value is only calculated and updated once.
    const newSetter = memoize((old:T) => {
        const newVal = updateVal(old);
        if(onUpdate) {onUpdate(index, newVal);}
        return newVal;
    }, {});

    // Update the subscribers if there are any
    if(!!subscribers[index]) {
        subscribers[index].forEach((setter) => {setter(newSetter);});
    }
}

const manageSubscribers = <T>(index: string, get:Func<void, T>, setVal:React.Dispatch<React.SetStateAction<T>>) => {
    React.useEffect(() => {
        const v = get();
        setVal(v);

        if(!subscribers[index]) {
            subscribers[index] = new Set<(val:any) => void>();
        }
        subscribers[index].add(setVal);
        return () => {
            subscribers[index].delete(setVal);
        }        
    }, [index, get, setVal]);
}

export const useGlobal = <T>(options?:IUseGlobalOptions<T>) =>
    (index: string, initialValue:T):[T, Func<T | Func<T, T>, void>] => {
        const get:Func<void, T> = options?.loadInitialValue
            ? options.loadInitialValue(index, initialValue)
            : () => initialValue;

        const [val, setVal] = React.useState<T>(get() || initialValue);
        manageSubscribers<T>(index, get, setVal);

        const set = updateSubscribers<T>(index, options?.onUpdate);

        return [val, set];
    }
