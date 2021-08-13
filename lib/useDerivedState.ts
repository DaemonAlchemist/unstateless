import * as React from 'react';
import { curValues, useGlobal } from './useGlobal';

export const useDerivedState = <T>(indexes:string[], extractor:((...args:any[]) => T)):T => {
    const [derivedValue, setDerivedValue] = React.useState<T>(extractor());

    const listener = React.useCallback((newVal:any, oldVal:any, index:any) => {
        setDerivedValue(extractor(...(indexes.map(index => curValues[index]))))
    }, [indexes, extractor]);

    React.useEffect(() => {
        indexes.forEach(index => {
            useGlobal.listen.on(index, listener);
        });
        
        return () => {
            indexes.forEach(index => {
                useGlobal.listen.off(index, listener);
            });
        }
    }, [indexes]);

    return derivedValue
}