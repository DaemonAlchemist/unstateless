module.exports = {
    "globals": {
      "ts-jest": {
        isolatedModules: true,
        jsx: "react",
        tsConfig: '<rootDir>/tsconfig.json'
      }
    },
    "resetMocks": false,
    "roots": [
      "<rootDir>/lib"
    ],
    "setupFiles":[
      "jest-localstorage-mock",
    ],
    "transform": {
      "^.+\\.tsx?$": "babel-jest",
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ],
  }