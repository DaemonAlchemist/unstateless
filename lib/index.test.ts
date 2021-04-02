// Imports go here

// Override console log for testing
let log:string[] = [];
let error:string[] = [];
console.clear = () => {
    log = [];
}
console.log = jest.fn((msg:string) => {log.push(msg)});
console.error = jest.fn((msg:string) => {error.push(msg)});

describe("this-library", () => {

});