# asset-loader
一个(基本)无感预加载资源文件的Loader，支持webpack和vite。

### 原理
将被导入的资源文件的url替换为实现了`toString`函数、继承`String`的特殊对象，因此预加载执行之前对资源文件URL的调用不受影响，执行之后资源文件url全部变为blob URL，保证加载完全。

此时，只需要使资源文件地址的使用（如DOM挂载）晚于预加载，即可实现资源文件使用时地址全部被替换的效果。

### 案例

#### 和`vue-router`配合使用
`vue-router`的beforeResolve是较为接近刚完成模块的动态导入的钩子。因此，在此处完成动态加载，可确保组件创建时URL被替换完毕。
```js
import { ensure } from '@xytoki/asset-loader'
router.beforeResolve(async () => {
    await ensure((loaded, total) => {
        // const progress = loaded / total
    })
})
```
#### usage in vite
```ts
import viteAssetLoader from '@xytoki/asset-loader/dist/vite';
export default defineConfig({
    plugins: [
        viteAssetLoader(
            /**
              如果需要指定被加载的文件，这里唯一的参数是一个正则。
              否则，将会使用vite的assetsInclude匹配被加载的文件。
             */
        )
    ],
});
```
#### usage in vue-cli for webpack4.x
```js
config.module.rule('svg').use('asset-loader').loader('@xytoki/asset-loader/dist/webpack').before('file-loader')
for (let m of ['images', 'media', 'fonts']) {
    config.module.rule(m).use('asset-loader').loader('@xytoki/asset-loader/dist/webpack').before('url-loader')
}
```
#### usage in vue-cli for webpack5.x
```js
config.module.rule('asset-loader').type('asset').set('resourceQuery', /asset-loader-raw/)
for (let m of ['images', 'media', 'fonts', 'svg']) {
    config.module.rule(m).type('javascript/auto').use('asset-loader').loader('@xytoki/asset-loader/dist/webpack')
}
```

### 其他API
为方便使用，除了替换URL之外，`asset-loader`还对图片进行了特殊处理，创建了对应的Image对象。
您可以方便地将此对象渲染至Canvas或传递给需要的库。
```js
import { asset } from '@xytoki/asset-loader'
import image from './image.png'
const imageAsset = asset(image);
// image实际上也是asset对象，但为了减少错误和类型安全，建议使用asset函数。
const imageObj = imageAsset.imageElement
const blob = imageAsset.blob
```
更多细节可以参照`src/runtime/index.ts`。