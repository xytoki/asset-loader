import { EventEmitter } from 'eventemitter3'
export class AssetLoader extends EventEmitter {
    verbose: boolean = process.env.NODE_ENV != 'production'
    store: Record<string, Asset> = {}
    urlToKey(url: string) {
        return url
    }
    push(url: string) {
        const key = this.urlToKey(url)
        if (!this.store[key]) {
            this.store[key] = new Asset(url, key)
            if (this.verbose) {
                console.log('[AssetLoader]', [this], 'PUSH', key, url.substring(0, 50))
            }
        } else {
            if (this.verbose) {
                console.log('[AssetLoader]', [this], 'RUSE', key, url.substring(0, 50))
            }
        }
        this.emit('push', this.store[key])
        return this.store[key]
    }
    get(url: string) {
        const a = this.store[this.urlToKey(url)]
        if (!a) {
            throw new Error(`AssetLoader.get: asset ${url} not pushed yet.`)
        }
        return a
    }
    async ensure(onProgress?: (loadedCount: number, total: number) => unknown) {
        const list = Object.values(this.store).filter((a) => !a.loaded)
        const total = list.length
        let loadedCount = 0
        const promises = []
        for (const a of list) {
            const p = a.load()
            promises.push(p)
            p.then(() => {
                loadedCount++
                onProgress && onProgress(loadedCount, total)
                if (this.verbose) {
                    console.log('[AssetLoader]', [this], 'PROG', `${loadedCount}/${total}`)
                }
            })
        }
        await Promise.all(promises)
        if (this.verbose) {
            console.log('[AssetLoader]', [this], 'ENSURE')
        }
        return list
    }
}
export const loader = new AssetLoader()
export function push(url: string) {
    return loader.push(url)
}
export function asset(url: string) {
    return loader.get(url)
}
export function ensure(onProgress?: (loadedCount: number, total: number) => unknown) {
    return loader.ensure(onProgress)
}

export class Asset extends String {
    key: string
    ext: string
    originalUrl: string

    loaded: boolean = false
    promise: Promise<string>
    _promise!: { resolve: (value: string) => void; reject: (reason?: any) => void }

    blob: Blob | null = null
    blobUrl: string | null = null

    imageElement: HTMLImageElement = new Image()
    customLoader: (asset: Asset) => Promise<unknown>

    constructor(url: string, key: string) {
        super(url)
        this.originalUrl = url
        this.key = key
        this.ext = url.split('.').pop() || ''
        this.promise = new Promise((resolve, reject) => {
            this._promise = { resolve, reject }
        })
        this.customLoader = () => Promise.resolve() as Promise<unknown>
    }

    toString() {
        return this.blobUrl || this.originalUrl
    }

    async load() {
        if (this.loaded) {
            return
        }
        const isDataUri = this.originalUrl.startsWith('data:')
        if (isDataUri) {
            this.blob = loadDataURI(this.originalUrl)
            return
        } else {
            const res = await fetch(this.originalUrl)
            if (res.ok) {
                this.blob = await res.blob()
            } else {
                throw new Error(`${res.status} ${res.statusText}`)
            }
        }
        this.blobUrl = URL.createObjectURL(this.blob)
        if (this.blob.type.startsWith('image/')) {
            await new Promise((resolve) => {
                this.imageElement.onload = resolve
                this.imageElement.src = this.blobUrl as string
            })
        }
        await this.customLoader(this)
        this.loaded = true
        this._promise.resolve(this.blobUrl)
    }
}

export function loadBlob(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response)
            } else {
                reject(xhr.statusText)
            }
        }
        xhr.onerror = () => {
            reject(xhr.statusText)
        }
        xhr.send()
    })
}

export function loadDataURI(datauri: string) {
    let arr = datauri.split(',')
    if (datauri.length < 2) {
        throw new Error('Invalid DataURI')
    }
    let mime = arr[0].split(':')[1].split(';')[0]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}
