import {extname} from 'path'
import Fly from 'flyio/dist/npm/fly'
import { computed, reactive } from "@vue/reactivity"

const fly = new Fly;
fly.config.responseType = 'blob';

const __store = {};
export const store = reactive(__store);

const __unloaded = [];
export const unloaded = reactive(__unloaded);

const __extMap = {
    images:["jpg","png","bmp","webp","svg"]
};
export const extMap = reactive(__extMap);

export const __config = {
    isDev:process.env.NODE_ENV!="production",
    pushCallback:null
};
export const config = reactive(__config);

export function urlToKey(url){
    let key = url;
    if(config.urlToKey){
        key = config.urlToKey(url)||key;
    }
    return key;
}

export function push(url){
    const origUrl = url;

    if(config.pushCallback){
        url = config.pushCallback(url)||url;
    }

    let key = urlToKey(url);

    if(store[key]){
        // url is a vue-computed value
        if(config.isDev){
            console.log("[AssetLoader]","RUSE",key,url);
        }
        return store[key].url;
    }

    let rawObject = {
        loaded:false,
        key,
        currUrl:url,
        origUrl,
        extName:extname(origUrl).replace(".",""),
        blob:null,
        blobUrl:null,
        imageObject:null,
    };

    let reactiveObject =reactive(rawObject);
    let computedUrl = computed(() => (reactiveObject.blobUrl||reactiveObject.currUrl));
    reactiveObject.url = computedUrl;

    store[key] = reactiveObject;
    unloaded.push(key);

    if(config.isDev){
        let c = ["[AssetLoader]","PUSH",key,url];
        if(url!=origUrl)c.push(origUrl);
        console.log(...c);
    }
    // return computedUrl and hook toString so webpack will use blobUrl after loaded
    computedUrl.toString = function(){
        return computedUrl.value;
    }
    return computedUrl;
}
export async function loadOne(obj,cb){
    if(obj.loaded)return;
    // Load as blob
    const resp = await fly.get(obj.currUrl);
    obj.blob = resp.data;
    obj.blobUrl = URL.createObjectURL(obj.blob);
    if(extMap.images.includes(obj.extName)){
        obj.imageObject = new Image();
        await new Promise((resolve)=>{
            obj.imageObject.onload=resolve;
            obj.imageObject.src = obj.blobUrl;
        });
    }
    obj.loaded = true;
    unloaded.splice(unloaded.indexOf(obj.key),1)
    if(cb)cb(obj);
    if(config.isDev){
        console.log("[AssetLoader]","LOAD",obj.key,obj.currUrl);
    }
}
export async function ensure(progress){
    let len = unloaded.length;
    let prg = 0;
    progress = progress||function(){};
    let pms = [];
    let loadList = [...unloaded];
    for(let i of loadList){
        pms.push(loadOne(store[i],function(){
            prg++;
            if(config.isDev){
                console.log("[AssetLoader]","PROG",`${prg}/${len}`);
            }
            progress(prg,len);
        }))
    }
    await Promise.all(pms);
    if(config.isDev){
        console.log("[AssetLoader]","ENSURE");
    }
}
export function asset(url){
    let key = urlToKey(url);
    return store[key];
}
export function assetUrl(url){
    let key = urlToKey(url);
    return store[key]?store[key].url:null
}
export const length = computed(() => Object.keys(_store).length);