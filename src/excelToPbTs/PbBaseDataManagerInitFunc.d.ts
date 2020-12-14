declare class PbBaseDataManagerInitFunc {
    private _init;
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    init(overFunc: Function): void;
    private _doInitData;
}
