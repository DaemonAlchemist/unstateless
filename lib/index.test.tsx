// Imports go here
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import * as React from 'react';
import { mergeProps, useSharedState } from '.';
import { useLocalStorage } from './useLocalStorage';
import { inject } from './inject';

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

const usePreset1 = () => useLocalStorage.string("preset1", "shouldnt-be-set");
const usePreset2 = () => useLocalStorage.string("preset2", "shouldnt-be-set");
const usePresetJson = () => useLocalStorage.object("presetJson1", {a: 3, b: 4});
const useNotSet = () => useLocalStorage.string("notSet1", "notSet1");

const TestLocalStorage = () => {
    const[preset1, setPreset1] = usePreset1();
    const[preset2, setPreset2] = usePreset2();
    const[notSet, setNotSet] = useNotSet();

    return <>
        <div data-testid="preset1">{preset1}</div>
        <button data-testid="preset1-button" onClick={() => {setPreset1("clicked-preset-1")}}>Click!</button>

        <div data-testid="preset2">{preset2}</div>
        <button data-testid="preset2-button" onClick={() => {setPreset2("clicked-preset-2")}}>Click!</button>

        <div data-testid="notSet1">{notSet}</div>
        <button data-testid="notSet1-button" onClick={() => {setNotSet("clicked-not-set-1")}}>Click!</button>
    </>;
}

const TestLocalStorage2 = () => {
    const[preset1, setPreset1] = usePreset1();
    const[preset2, setPreset2] = usePreset2();
    const[notSet, setNotSet] = useNotSet();
    const[presetJson1, setPresetJson1] = usePresetJson();

    return <>
        <div data-testid="preset1-2">{preset1}</div>
        <button data-testid="preset1-button-2" onClick={() => {setPreset1("clicked-preset-1")}}>Click!</button>

        <div data-testid="preset2-2">{preset2}</div>
        <button data-testid="preset2-button-2" onClick={() => {setPreset2("clicked-preset-2")}}>Click!</button>

        <div data-testid="notSet1-2">{notSet}</div>
        <button data-testid="notSet1-button-2" onClick={() => {setNotSet("clicked-not-set-1")}}>Click!</button>

        <div data-testid="a">{presetJson1.a}</div>
        <div data-testid="b">{presetJson1.b}</div>
        <button data-testid="presetjson1-button" onClick={() => {setPresetJson1({a: 5, b: 6})}}>Click!</button>
    </>;
}

const injectA = (props:any) => ({...props, a: "A"});
const injectB = (props:any) => ({...props, b: "B"});
const injectCD = (props:any) => ({...props, c: "C", d: "D"});

interface InjectProps {
    a: string;
    b: string;
    c: string;
    d: string;
}
const TestInjectStateless = (props:InjectProps) => <>
    <div data-testid="a">{props.a}</div>
    <div data-testid="b">{props.b}</div>
    <div data-testid="c">{props.c}</div>
    <div data-testid="d">{props.d}</div>
</>;

const connect = inject<{}, InjectProps>(mergeProps(injectA, injectB, injectCD));
const TestInjectStateful = connect(TestInjectStateless);

beforeEach(() => {
    localStorage.clear();

    // Setup initial localStorage values
    localStorage.setItem("preset1", "foo1");
    localStorage.setItem("preset2", "foo2");
    localStorage.setItem("presetJson1", JSON.stringify({a: 1, b: 2}));

    jest.clearAllMocks();
});
window.localStorage = localStorage;

describe("unstateless", () => {
    describe("test setup", () => {
        it("should setup localstorage", () => {
            expect(localStorage.getItem("preset1")).toEqual("foo1");
            expect(localStorage.getItem("preset2")).toEqual("foo2");
            expect(localStorage.getItem("presetJson1")).toEqual('{"a":1,"b":2}');
        });
    });
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
    describe("useLocalStorage", () => {
        it("should load raw intial values from localstorage if available", () => {
            render(<TestLocalStorage />);

            expect(screen.getByTestId("notSet1")).toHaveTextContent("notSet1");
            expect(screen.getByTestId("preset1")).toHaveTextContent("foo1");
            expect(screen.getByTestId("preset2")).toHaveTextContent("foo2");
        });
        it("should load JSON intial values from localstorage if available", () => {
            render(<TestLocalStorage2 />);

            expect(screen.getByTestId("a")).toHaveTextContent("1");
            expect(screen.getByTestId("b")).toHaveTextContent("2");
        });
        it("should save to localStorage when updating", () => {
            render(<TestLocalStorage />);
            fireEvent.click(screen.getByTestId("preset1-button"));

            expect(localStorage.setItem).toHaveBeenCalledWith("preset1", "clicked-preset-1");
        });
        it("should rerender all components when updating", () => {
            render(<><TestLocalStorage /><TestLocalStorage2 /></>);

            fireEvent.click(screen.getByTestId("preset1-button"));
            expect(screen.getByTestId("preset1-2")).toHaveTextContent("clicked-preset-1");
        })
    });
    describe("inject", () => {
        it("should inject props into components", () => {
            render(<TestInjectStateful />);

            expect(screen.getByTestId("a")).toHaveTextContent("A");
            expect(screen.getByTestId("b")).toHaveTextContent("B");
            expect(screen.getByTestId("c")).toHaveTextContent("C");
            expect(screen.getByTestId("d")).toHaveTextContent("D");
        });
    })
});
