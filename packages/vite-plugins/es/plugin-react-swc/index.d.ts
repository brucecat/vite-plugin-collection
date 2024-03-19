import { FilterPattern, PluginOption } from 'vite';
import { JscTarget } from '@swc/core';

type ViteOptions = {
    /**
     * Control where the JSX factory is imported from.
     * @default "react"
     */
    jsxImportSource?: string;
    include?: FilterPattern;
    exclude?: FilterPattern;
    target?: JscTarget;
};

declare const plugin: (_options?: ViteOptions) => PluginOption[];

export { plugin as default };
