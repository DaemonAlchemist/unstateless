module.exports = {
    "globals": {
      "ts-jest": {
        isolatedModules: true,
      }
    },
    "roots": [
      "<rootDir>/lib"
    ],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
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