var PbBaseDataManagerInitFunc = /** @class */ (function () {
    function PbBaseDataManagerInitFunc() {
        this._init = false;
    }
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    PbBaseDataManagerInitFunc.prototype.init = function (overFunc) {
        var _this = this;
        if (!this._init) {
            this._init = true;
            loader.loadRes("youProjectExcelRes", null, function (err, data) {
                if (err) {
                    _this._init = false;
                    console.error(err);
                }
                else {
                    var bin = new Uint8Array(data._file);
                    _this._doInitData(bin);
                }
                if (overFunc) {
                    overFunc(err, _this);
                }
            });
        }
    };
    PbBaseDataManagerInitFunc.prototype._doInitData = function (uIntPbData) {
        "replace you _doInitData imm";
    };
    return PbBaseDataManagerInitFunc;
}());
//# sourceMappingURL=PbBaseDataManagerInitFunc.js.map