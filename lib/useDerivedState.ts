import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { ISharedState } from './types';
import { curValues, useGlobal } from './useGlobal';

export const useDerivedState = <T>(extractor:((...args:any[]) => T), states:ISharedState<any>[]):T => {
    
    const subscribe = React.useCallback((onStoreChange: () => void) => {
        // console.log("useDerivedState subscribe called");
        const listener = (newVal:any, oldVal:any, index:any) => {
            onStoreChange();
        }
        states.forEach(index => {
            useGlobal.listen.on(index, listener);
        });
        
        return () => {
            states.forEach(index => {
                useGlobal.listen.off(index, listener);
            });
        }
    }, [states]);

    const cache = React.useRef<{args: any[], result: T} | undefined>(undefined);

    const getSnapshot = React.useCallback(() => {
        const newArgs = states.map(index => curValues[index.__index__]);
        
        if (cache.current) {
            const { args, result } = cache.current;
            if (args.length === newArgs.length && args.every((val, i) => val === newArgs[i])) {
                return result;
            }
        }

        const result = extractor(...newArgs);
        // console.log("useDerivedState computed:", result, "args:", newArgs);
        cache.current = { args: newArgs, result };
        return result;
    }, [states, extractor]);

    return useSyncExternalStore(subscribe, getSnapshot);
}