
export const runtimePublicPath = '/@react-refresh'

// 热更新
export const preambleCode = /*js*/ `
  import { injectIntoGlobalHook } from "__PATH__";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
`

export const refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/

export const coreJsVersion = '3.36.1';