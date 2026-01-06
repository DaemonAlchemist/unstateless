import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { ISharedState } from './types';
import { curValues, useGlobal } from './useGlobal';

export const useDerivedState = <T>(extractor:((...args:any[]) => T), states:ISharedState<any>[]):T => {
    
    const subscribe = React.useCallback((onStoreChange: () => void) => {
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

    const getSnapshot = React.useCallback(() => {
        return extractor(...(states.map(index => curValues[index.__index__])));
    }, [states, extractor]);

    return useSyncExternalStore(subscribe, getSnapshot);
}