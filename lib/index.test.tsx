// Imports go here
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import * as React from 'react';

// Override console log for testing
let log:string[] = [];
let error:string[] = [];
console.clear = () => {
    log = [];
}
console.log = jest.fn((msg:string) => {log.push(msg)});
console.error = jest.fn((msg:string) => {error.push(msg)});

describe("unstateless", () => {
    describe("setup", () => {
        it("runs enzyme", () => {
            const Test = () => {
                const [test, setTest] = React.useState("test");
                return <div data-testid="test">{test}</div>;
            }
            render(<Test />);
            expect(screen.getByTestId("test")).toHaveTextContent("test");
        })
    });

});