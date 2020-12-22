var Refrence = {};
var loader = {};
var JsonAsset = /** @class */ (function () {
    function JsonAsset() {
    }
    return JsonAsset;
}());
var BaseDataManagerInitFunc = /** @class */ (function () {
    function BaseDataManagerInitFunc() {
        this._init = false;
    }
    /**
     * 加载完成数据后的回调
     * @param overFunc
     */
    BaseDataManagerInitFunc.prototype.init = function (overFunc) {
        var _this = this;
        if (!this._init) {
            this._init = true;
            loader.loadRes("youProjectExcelRes", JsonAsset, function (err, data) {
                if (err) {
                    _this._init = false;
                    console.error(err);
                }
                else {
                    _this._doInitData(data.json);
                }
                if (overFunc) {
                    overFunc(err, _this);
                }
            });
        }
    };
    BaseDataManagerInitFunc.prototype._doInitData = function (jsonData) {
        var beginTime = Date.now();
        for (var tablleName in jsonData) {
            var originTableData = jsonData[tablleName];
            var settingTableData = this[tablleName];
            if (!settingTableData) {
                console.error("error!!! not has tablleName " + tablleName);
                break;
            }
            for (var i = 0; i < originTableData.values.length; i++) {
                var valueDatas = originTableData.values[i];
                var data = new Refrence[tablleName]();
                for (var index = 0; index < valueDatas.length; index++) {
                    var element = valueDatas[index];
                    var key = originTableData.keys[index];
                    if (data[key] === undefined) {
                        console.error("error!!! not has key " + key);
                        break;
                    }
                    data[key] = element;
                }
                settingTableData[originTableData.ids[i]] = data;
            }
        }
        // 查找外键
        for (var tablleName in jsonData) {
            var originTableData = jsonData[tablleName];
            var settingTableData = this[tablleName];
            if (!settingTableData) {
                console.error("error!!! not has tablleName " + tablleName);
                break;
            }
            for (var key in originTableData.foreign) {
                var foreignSearchData = originTableData.foreign[key];
                var table = this[foreignSearchData.dataType];
                // 只能通过主键来查找
                for (var itemKey in settingTableData) {
                    var data = settingTableData[itemKey];
                    if (data !== null) {
                        var attritubeData = data[key];
                        var foreignData = null;
                        if (attritubeData !== null && attritubeData !== "") {
                            if (Array.isArray(attritubeData)) {
                                foreignData = [];
                                for (var index = 0; index < attritubeData.length; index++) {
                                    var element = attritubeData[index];
                                    if (element !== null && element !== "") {
                                        var searchData = table[element];
                                        if (searchData === undefined) {
                                            console.error("error!!! get data by key " + element);
                                            console.error(data);
                                        }
                                        foreignData.push(searchData);
                                    }
                                }
                            }
                            else {
                                var searchData = table[attritubeData];
                                if (searchData === undefined) {
                                    console.error("error!!! get data by key " + attritubeData);
                                    console.error(data);
                                }
                                foreignData = searchData;
                            }
                        }
                        data[key] = foreignData;
                    }
                }
            }
        }
        // 组装数据
        console.log("data combination cost time " + (Date.now() - beginTime));
    };
    return BaseDataManagerInitFunc;
}());
//# sourceMappingURL=BaseDataManagerInitFunc.js.map