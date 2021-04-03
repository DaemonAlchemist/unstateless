module.exports = {
    "globals": {
      "ts-jest": {
        isolatedModules: true,
        jsx: "react",
        tsConfig: '<rootDir>/tsconfig.json'
      }
    },
    "roots": [
      "<rootDir>/lib"
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