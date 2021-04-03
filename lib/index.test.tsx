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

describe("unstateless", () => {
    describe("setup", () => {
        it("runs enzyme with hooks", () => {
            const Test = () => {
                const [test, setTest] = React.useState("test");
                const update = () => {setTest("clicked");}
                return <>
                    <div data-testid="test">{test}</div>
                    <button data-testid="button" onClick={update} >Click</button>
                </>;
            }
            render(<Test />);
            expect(screen.getByTestId("test")).toHaveTextContent("test");
            fireEvent.click(screen.getByTestId("button"));
            expect(screen.getByTestId("test")).toHaveTextContent("clicked");

        });
    });
    describe("useSharedState", () => {
        it("works within a single component", () => {
            const useTest = () => useSharedState("test", "test");
            const Test = () => {
                const [test, setTest] = useTest();
                const update = () => {setTest("clicked");}
                return <>
                    <div data-testid="test">{test}</div>
                    <button data-testid="button" onClick={update} >Click</button>
                </>;
            }
            render(<Test />);
            expect(screen.getByTestId("test")).toHaveTextContent("test");
            fireEvent.click(screen.getByTestId("button"));
            expect(screen.getByTestId("test")).toHaveTextContent("clicked");
        });
        it("shares values with multiple components", () => {
            const useTest = () => useSharedState("test", "test");
            const Test1 = () => {
                const [test, setTest] = useTest();
                const update = () => {setTest("clicked");}
                return <>
                    <div data-testid="test1">{test}</div>
                    <button data-testid="button1" onClick={update} >Click</button>
                </>;
            }
            const Test2 = () => {
                const [test, setTest] = useTest();
                const update = () => {setTest("clicked");}
                return <>
                    <div data-testid="test2">{test}</div>
                    <button data-testid="button2" onClick={update} >Click</button>
                </>;
            }
            render(<><Test1 /><Test2 /></>);
            expect(screen.getByTestId("test1")).toHaveTextContent("test");
            expect(screen.getByTestId("test2")).toHaveTextContent("test");
            fireEvent.click(screen.getByTestId("button1"));
            expect(screen.getByTestId("test1")).toHaveTextContent("clicked");
            expect(screen.getByTestId("test2")).toHaveTextContent("clicked");
        });
    });
});