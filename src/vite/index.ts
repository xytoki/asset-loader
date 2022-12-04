import { Plugin } from 'vite';
const ViteAssetLoader = (regex?: RegExp) => {
    let isSSR = false;
    let assetsInclude: (filename: string) => boolean;
    return {
        name: '@xytoki/asset-loader',
        enforce: 'pre',
        config(_config, { ssrBuild }) {
            isSSR = !!ssrBuild;
        },
        configResolved(config) {
            assetsInclude = regex ? (filename: string) => regex.test(filename) : config.assetsInclude;
        },
        resolveId(id) {
            if (isSSR) return;
            if (!id.includes('virtual:asset-loader:') && !id.includes('?url') && assetsInclude(id)) {
                const virtualId = '\0virtual:asset-loader:' + id;
                return virtualId;
            }
        },
        load(id) {
            if (id.includes('virtual:asset-loader:')) {
                const url = id.replace('\0virtual:asset-loader:', '') + '?url';
                return [
                    `import { push } from '@xytoki/asset-loader';`,
                    `import orig from ${JSON.stringify(url)};`,
                    `export default push(orig);`,
                ].join('\r\n');
            }
        },
    } as Plugin;
};
export default ViteAssetLoader;
