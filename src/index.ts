import { createHash } from 'crypto'
import fs from 'fs'
import { relative, extname } from 'path'
import { Transformer } from '@jest/transform'
import { transformSync, Loader } from 'esbuild'
import { resolveOptions } from './options'
import { UserOptions } from './type'

const THIS_FILE = fs.readFileSync(__filename)

function isTarget(path: string) {
  return /\.[jt]sx?$/.test(path)
}

declare module '@jest/types' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Config {
    interface ConfigGlobals {
      'esbuild-jest'?: UserOptions
    }
  }
}

const createTransformer = (userOptions: UserOptions = {}): Transformer<UserOptions> => {
  const options = resolveOptions(userOptions)

  return {
    canInstrument: true,
    getCacheKey(fileData, filePath, transformOptions) {
      const { config, instrument, configString } = transformOptions

      return createHash('md5')
        .update(THIS_FILE)
        .update('\0', 'utf8')
        .update(JSON.stringify(options))
        .update('\0', 'utf8')
        .update(fileData)
        .update('\0', 'utf8')
        .update(relative(config.rootDir, filePath))
        .update('\0', 'utf8')
        .update(configString)
        .update('\0', 'utf8')
        .update(filePath)
        .update('\0', 'utf8')
        .update(instrument ? 'instrument' : '')
        .update('\0', 'utf8')
        .update(process.env.NODE_ENV || '')
        .digest('hex')
    },
    process(source, path, transformOptions) {
      const { config } = transformOptions
      if (!isTarget(path))
        return source

      const result = transformSync(source, {
        ...options,
        ...config.globals['esbuild-jest'] as UserOptions,
        loader: userOptions.loader || extname(path).slice(1) as Loader,
      })

      if (result.warnings.length) {
        result.warnings.forEach((m) => {
          // eslint-disable-next-line no-console
          console.warn(m)
        })
      }
      return {
        code: result.code,
        map: result.map,
      }
    },
  }
}

export default {
  createTransformer,
}
