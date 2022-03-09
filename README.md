# esbuild-jest

A Jest transformer using esbuild

## Install

```bash
npm install -D @ohpz/esbuild-jest
```

Set `transform` TypeScript file to `@ohpz/esbuild-jest` inside `jest.config.js`

```json5
{
  "transform": {
    "^.+\\.tsx?$": "@ohpz/esbuild-jest"
  }
}
```

Specify esbuild options

```js
const esbuildOptions = {}

module.export = {
  transform: {
    "^.+\\.tsx?$": [
      "@ohpz/esbuild-jest",
      esbuildOptions
    ]
  }
}
```

## License

MIT License © 2021 [hannoeru](https://github.com/hannoeru)
