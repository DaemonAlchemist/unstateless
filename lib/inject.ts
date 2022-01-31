import * as React from 'react';
import { Func } from "ts-functional/dist/types";
import { Injector } from "./types";

export const inject = <A extends {}, B extends {}>(injector:Injector<A, B>) =>
    (Component:React.ComponentType<B>):Func<A, JSX.Element> =>
        (props:A):JSX.Element =>
            React.createElement(Component, injector(props));

export const createInjector = <OutputProps, InputProps = any>(f:Func<InputProps, OutputProps>) => <T extends InputProps>(props:T):T & OutputProps => {
    const outputProps:OutputProps = f(props);
    return {...props, ...outputProps};
}
            