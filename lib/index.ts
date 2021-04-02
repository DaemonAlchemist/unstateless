import { pipe } from 'ts-functional';
import { useGlobal } from './useGlobal';

export { inject } from "./inject";
export { useLocalStorage } from "./useLocalStorage";
export const useSharedState = useGlobal();
export const mergeProps = pipe;

