// src/plugin-react-swc/index.ts
import { transform } from "@swc/core";
import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createFilter } from "vite";
import { createRequire } from "node:module";

// src/plugin-react-swc/const.ts
var runtimePublicPath = "/@react-refresh";
var preambleCode = (
  /*js*/
  `
  import { injectIntoGlobalHook } from "__PATH__";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
`
);
var refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/;

// src/plugin-react-swc/index.ts
var _dirname = typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));
var _resolve = typeof global.require !== "undefined" ? global.require.resolve : createRequire(import.meta.url).resolve;
var plugin = (_options) => {
  const options = {
    ..._options,
    target: _options?.target || "es2017",
    jsxImportSource: _options?.jsxImportSource || "react"
  };
  const buildTarget = options.target;
  const filter = options.include || options.exclude ? createFilter(options.include, options.exclude) : null;
  const transformWithSwc = async (fileName, code, reactConfig) => {
    if (!filter && fileName.includes("node_modules") || filter && !filter(fileName))
      return;
    const decorators = true;
    const parser = fileName.endsWith(".tsx") ? { syntax: "typescript", tsx: true, decorators } : fileName.endsWith(".ts") ? { syntax: "typescript", tsx: false, decorators } : fileName.endsWith(".jsx") ? { syntax: "ecmascript", jsx: true } : fileName.endsWith(".mdx") ? (
      // JSX is required to trigger fast refresh transformations, even if MDX already transforms it
      { syntax: "ecmascript", jsx: true }
    ) : void 0;
    if (!parser)
      return;
    let result;
    try {
      const swcTransformConfig = {
        // 允许被配置文件覆盖
        swcrc: true,
        rootMode: "upward-optional",
        filename: fileName,
        minify: false,
        jsc: {
          // target: buildTarget,
          parser,
          transform: {
            useDefineForClassFields: false,
            react: {
              ...reactConfig,
              useBuiltins: true
            }
          }
        },
        env: {
          targets: {
            safari: "11",
            edge: "79",
            chrome: "73"
          },
          mode: "usage",
          coreJs: "3.36"
        }
      };
      if (swcTransformConfig.env && swcTransformConfig.jsc.target) {
        delete swcTransformConfig.jsc.target;
      }
      result = await transform(code, swcTransformConfig);
    } catch (e) {
      const message = e.message;
      const fileStartIndex = message.indexOf("\u256D\u2500[");
      if (fileStartIndex !== -1) {
        const match = message.slice(fileStartIndex).match(/:(\d+):(\d+)]/);
        if (match) {
          e.line = match[1];
          e.column = match[2];
        }
      }
      throw e;
    }
    return result;
  };
  const silenceUseClientWarning = (userConfig) => ({
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
          return;
        }
        if (userConfig.build?.rollupOptions?.onwarn) {
          userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
        } else {
          defaultHandler(warning);
        }
      }
    }
  });
  const resolveSwcHelpersDeps = () => {
    let helperList = [];
    try {
      const file = _resolve("@swc/helpers");
      if (file) {
        const dir = dirname(file);
        const files = readdirSync(dir);
        helperList = files.map((file2) => join(dir, file2));
      }
    } catch (e) {
      console.error(e);
    }
    return helperList;
  };
  return [
    // dev时热更新1：加载热更新功能
    {
      name: "vite:swc:resolve-runtime",
      apply: "serve",
      enforce: "pre",
      // Run before Vite default resolve to avoid syscalls
      resolveId: (id) => id === runtimePublicPath ? id : void 0,
      load: (id) => id === runtimePublicPath ? readFileSync(join(_dirname, "refresh-runtime.js"), "utf-8") : void 0
    },
    // dev时热更新2：热更新核心插件
    {
      name: "vite:swc",
      apply: "serve",
      config: (userConfig) => {
        const userOptimizeDepsConfig = userConfig?.optimizeDeps?.disabled;
        const optimizeDepsDisabled = userOptimizeDepsConfig === true || userOptimizeDepsConfig === "dev";
        const optimizeDeps = !optimizeDepsDisabled ? ["react", `${options.jsxImportSource}/jsx-dev-runtime`, ...resolveSwcHelpersDeps()] : void 0;
        return {
          esbuild: false,
          optimizeDeps: {
            include: optimizeDeps,
            esbuildOptions: {
              target: buildTarget,
              supported: {
                decorators: true
                // esbuild 0.19在使用target为es2017时，预构建会报错，这里假定目标浏览器支持装饰器，避开报错
              }
            }
          },
          resolve: {
            dedupe: ["react", "react-dom"]
          }
        };
      },
      transformIndexHtml: (_, config) => [
        {
          tag: "script",
          attrs: { type: "module" },
          children: preambleCode.replace("__PATH__", config.server.config.base + runtimePublicPath.slice(1))
        }
      ],
      async transform(code, _id, transformOptions) {
        const id = _id.split("?")[0];
        const result = await transformWithSwc(id, code, {
          refresh: !transformOptions?.ssr,
          development: true,
          runtime: "automatic",
          importSource: options.jsxImportSource
        });
        if (!result)
          return;
        if (transformOptions?.ssr || !refreshContentRE.test(result.code)) {
          return result;
        }
        result.code = /*js*/
        `
          import * as RefreshRuntime from "${runtimePublicPath}";
          if (!window.$RefreshReg$) throw new Error("React refresh preamble was not loaded. Something is wrong.");
          const prevRefreshReg = window.$RefreshReg$;
          const prevRefreshSig = window.$RefreshSig$;
          window.$RefreshReg$ = RefreshRuntime.getRefreshReg("${id}");
          window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;

          ${result.code}

          window.$RefreshReg$ = prevRefreshReg;
          window.$RefreshSig$ = prevRefreshSig;
          RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
            RefreshRuntime.registerExportsForReactRefresh("${id}", currentExports);
            import.meta.hot.accept((nextExports) => {
              if (!nextExports) return;
              const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(currentExports, nextExports);
              if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
            });
          });
        `;
        if (result.map) {
          const sourceMap = JSON.parse(result.map);
          sourceMap.mappings = ";;;;;;;;" + sourceMap.mappings;
          return { code: result.code, map: sourceMap };
        } else {
          return { code: result.code };
        }
      }
    },
    // 打包时候使用的插件
    {
      name: "vite:swc",
      apply: "build",
      enforce: "post",
      // Run before esbuild
      config: (userConfig) => ({
        build: {
          ...silenceUseClientWarning(userConfig),
          target: buildTarget
        },
        resolve: {
          dedupe: ["react", "react-dom"]
        }
      }),
      transform: (code, _id) => transformWithSwc(_id.split("?")[0], code, {
        runtime: "automatic",
        importSource: options.jsxImportSource
      })
    }
  ];
};
var plugin_react_swc_default = plugin;
export {
  plugin_react_swc_default as default
};
