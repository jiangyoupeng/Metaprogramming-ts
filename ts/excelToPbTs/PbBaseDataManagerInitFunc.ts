class PbBaseDataManagerInitFunc {
    private _init: boolean = false
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    init(overFunc: Function) {
        if (!this._init) {
            this._init = true

            loader.loadRes("youProjectExcelRes", null, (err: any, data: any) => {
                if (err) {
                    this._init = false
                    console.error(err)
                } else {
                    let bin: Uint8Array = new Uint8Array(<ArrayBuffer>data._file)
                    this._doInitData(bin)
                }
                if (overFunc) {
                    overFunc(err, this)
                }
            })
        }
    }

    private _doInitData(uIntPbData: Uint8Array) {
        "replace you _doInitData imm"
    }
}
