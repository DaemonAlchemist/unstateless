import * as React from 'react';
import { ISharedState } from './types';
import { curValues, useGlobal } from './useGlobal';

export const useDerivedState = <T>(states:ISharedState<any>[], extractor:((...args:any[]) => T)):T => {
    const [derivedValue, setDerivedValue] = React.useState<T>(extractor());

    const listener = React.useCallback((newVal:any, oldVal:any, index:any) => {
        setDerivedValue(extractor(...(states.map(index => curValues[index.__index__]))))
    }, [states, extractor]);

    React.useEffect(() => {
        states.forEach(index => {
            useGlobal.listen.on(index, listener);
        });
        
        return () => {
            states.forEach(index => {
                useGlobal.listen.off(index, listener);
            });
        }
    }, [states]);

    return derivedValue;
}