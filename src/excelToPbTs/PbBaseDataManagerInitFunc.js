class PbBaseDataManagerInitFunc {
    constructor() {
        this._init = false;
    }
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    init(overFunc) {
        if (!this._init) {
            this._init = true;
            loader.loadRes("youProjectExcelRes", null, (err, data) => {
                if (err) {
                    this._init = false;
                    console.error(err);
                }
                else {
                    let bin = new Uint8Array(data._file);
                    this._doInitData(bin);
                }
                if (overFunc) {
                    overFunc(err, this);
                }
            });
        }
    }
    _doInitData(uIntPbData) {
        "replace you _doInitData imm";
    }
}
//# sourceMappingURL=PbBaseDataManagerInitFunc.js.map