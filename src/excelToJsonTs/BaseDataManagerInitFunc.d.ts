declare let Refrence: {};
declare let loader: any;
declare class JsonAsset {
    json: string;
}
declare class BaseDataManagerInitFunc {
    private _init;
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    init(overFunc: Function): void;
    private _doInitData;
}
