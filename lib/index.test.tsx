// Imports go here
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import * as React from 'react';
import { useSharedState } from '.';

// Override console log for testing
let log:string[] = [];
let error:string[] = [];
console.clear = () => {
    log = [];
}
// console.log = jest.fn((msg:string) => {log.push(msg)});
// console.error = jest.fn((msg:string) => {error.push(msg)});

const useTest = () => useSharedState("test", "test");
const useFoo = () => useSharedState("foo", "foo");

const Test1 = () => {
    const [test, setTest] = useTest();
    const [foo, setFoo] = useFoo();
    const updateTest = () => {setTest("clicked");}
    const updateFoo = () => {setFoo("clicked-foo");}
    return <>
        <div data-testid="test1">{test}</div>
        <button data-testid="button1" onClick={updateTest} >Click</button>
        <div data-testid="foo1">{foo}</div>
        <button data-testid="foo-button1" onClick={updateFoo} >Click</button>
    </>;
}
const Test2 = () => {
    const [test, setTest] = useTest();
    const [foo, setFoo] = useFoo();
    const updateTest = () => {setTest("clicked");}
    const updateFoo = () => {setFoo("clicked-foo");}
    return <>
        <div data-testid="test2">{test}</div>
        <button data-testid="button2" onClick={updateTest} >Click</button>
        <div data-testid="foo2">{foo}</div>
        <button data-testid="foo-button2" onClick={updateFoo} >Click</button>
    </>;
}

describe("unstateless", () => {
    describe("useSharedState", () => {
        it("works within a single component", () => {
            render(<Test1 />);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("foo-button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("clicked-foo");
        });
        it("shares values with multiple components", () => {
            const useTest = () => useSharedState("test", "test");
            render(<><Test1 /><Test2 /></>);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(screen.getByTestId("test2")).toHaveTextContent("test");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("test2")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("foo");
            fireEvent.click(screen.getByTestId("foo-button2"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("test2")).toHaveTextContent("clicked");
            expect(screen.getByTestId("foo1")).toHaveTextContent("clicked-foo");
            expect(screen.getByTestId("foo2")).toHaveTextContent("clicked-foo");
        });
    });
});