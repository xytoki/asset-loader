# assetLoader
一个(基本)无感预加载资源文件的Loader

### 原理
将被导入的资源文件的url替换为实现了`toString`函数、继承`String`的特殊对象，实现动态在加载后修改导入后资源文件的url。

### 案例

#### 和`vue-router`配合使用
```js
import { ensure } from '@xytoki/asset-loader'
router.beforeResolve(async () => {
    await ensure((loaded, total) => {
        // const progress = loaded / total
    })
})
```
#### demo in vue-cli for webpack4.x
```js
config.module.rule('svg').use('asset-loader').loader('@xytoki/asset-loader/loader').before('file-loader')
for (let m of ['images', 'media', 'fonts']) {
    config.module.rule(m).use('asset-loader').loader('@xytoki/asset-loader/loader').before('url-loader')
}
```
#### demo in vue-cli for webpack5.x
```js
config.module.rule('asset-loader').type('asset').set('resourceQuery', /asset-loader-raw/)
for (let m of ['images', 'media', 'fonts', 'svg']) {
    config.module.rule(m).type('javascript/auto').use('asset-loader').loader('@xytoki/asset-loader/loader')
}
```