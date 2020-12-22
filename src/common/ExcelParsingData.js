import * as fs from "fs";
import * as xlsx from "xlsx";
// int 默认为int32,如果要声明为int64需要特殊写明
var supportTypeDefine = new Set(["int", "int64", "float", "double", "bool", "string"]);
var excelTypeToTsTypeDefine = new Map([
    ["int", "number"],
    ["int64", "number"],
    ["float", "number"],
    ["double", "number"],
    ["bool", "boolean"],
    ["string", "string"],
]);
var excelTypeToPbTypeDefine = new Map([
    ["int", "int32"],
    ["int64", "int64"],
    ["float", "float"],
    ["double", "double"],
    ["bool", "bool"],
    ["string", "string"],
]);
var excelKeyBeginDefine = "__EMPTY";
var primaryKeyDefine = "PRIMARY";
var foreignKeyDefine = "FOREIGN:";
export function convertExcelTypeToTsType(type) {
    var tsType;
    if (supportTypeDefine.has(type)) {
        tsType = excelTypeToTsTypeDefine.get(type);
    }
    else {
        var factType = type;
        var arrIndex = type.indexOf("[]");
        if (arrIndex != -1) {
            factType = type.substring(0, arrIndex);
        }
        if (supportTypeDefine.has(factType)) {
            tsType = excelTypeToTsTypeDefine.get(factType) + "[]";
        }
        else {
            console.error("错误的类型转换 " + type);
        }
    }
    return tsType;
}
export function convertExcelTypeToPbType(type) {
    var tsType;
    if (supportTypeDefine.has(type)) {
        tsType = excelTypeToPbTypeDefine.get(type);
    }
    else {
        var factType = type;
        var arrIndex = type.indexOf("[]");
        if (arrIndex != -1) {
            factType = type.substring(0, arrIndex);
        }
        if (supportTypeDefine.has(factType)) {
            tsType = excelTypeToPbTypeDefine.get(factType) + "[]";
        }
        else {
            console.error("错误的类型转换 " + type);
        }
    }
    return tsType;
}
var ForegignData = /** @class */ (function () {
    function ForegignData(foreignTableName, foreignKeyName) {
        this.foreignTableName = foreignTableName;
        this.foreignKeyName = foreignKeyName;
    }
    return ForegignData;
}());
var ExcelObjData = /** @class */ (function () {
    function ExcelObjData(tableData, tableKey, isClient) {
        // key都为name那一列
        this.dataArr = [];
        this.tipsMap = new Map();
        this.nameSet = new Set();
        this.typeMap = new Map();
        this.foreignMap = new Map();
        this._initSuc = false;
        var tipsData = tableData[0];
        var cOrsLogoData = tableData[1];
        var typeData = tableData[2];
        var nameData = tableData[3];
        var refrenceData = tableData[4];
        if (typeData === undefined || nameData === undefined) {
            console.error("错误的excel表 " + tableKey + " 类型数据和命名数据不能为空");
            return;
        }
        // 长度为type或者name的长度 如果两者不一致 说明数据表有问题
        var index = 0;
        var searchKeyMap = new Map();
        while (true) {
            var searchKey = excelKeyBeginDefine;
            if (index > 0) {
                searchKey = searchKey + "_" + index;
            }
            index++;
            var name_1 = nameData[searchKey];
            var type = typeData[searchKey];
            // 正常退出
            if (type === undefined && name_1 == undefined) {
                break;
            }
            if (type === undefined || name_1 == undefined) {
                console.error("错误的excel表 " + tableKey + " 类型和名字不能为空");
                return;
            }
            if (this.nameSet.has(name_1)) {
                console.error("错误的excel表 " + tableKey + " 不可定义重复的name " + name_1);
                return;
            }
            if (!supportTypeDefine.has(type)) {
                var factType = type;
                var arrIndex = type.indexOf("[]");
                if (arrIndex != -1) {
                    factType = type.substring(0, arrIndex);
                }
                if (!supportTypeDefine.has(factType)) {
                    console.error("错误的excel表 " + tableKey + " 不支持的类型 " + type);
                    return;
                }
            }
            var cOrsLogo = cOrsLogoData[searchKey];
            if (!cOrsLogo) {
                console.warn("excel表 " + tableKey + " 没有声明c/s " + name_1);
                continue;
            }
            // 非当前系统需要的队列不需要用
            if ((isClient && cOrsLogo.indexOf("c") == -1 && cOrsLogo.indexOf("C") == -1) ||
                (!isClient && cOrsLogo.indexOf("s") == -1 && cOrsLogo.indexOf("S") == -1)) {
                continue;
            }
            this.nameSet.add(name_1);
            var tips = tipsData[searchKey];
            if (tips) {
                this.tipsMap.set(name_1, tips);
            }
            this.typeMap.set(name_1, type);
            var ref = refrenceData[searchKey];
            if (ref) {
                if (ref === primaryKeyDefine) {
                    this.primaryKey = searchKey;
                    this.primaryKeyName = name_1;
                }
                else if (ref.indexOf(foreignKeyDefine) === 0) {
                    var refData = ref.substring(foreignKeyDefine.length);
                    var params = refData.split(".");
                    this.foreignMap.set(name_1, new ForegignData(params[0], params[1]));
                }
                else {
                    console.error("错误的ref建定义 " + ref);
                    return;
                }
            }
            searchKeyMap.set(name_1, searchKey);
        }
        var _loop_1 = function (itemIndex) {
            var itemData = tableData[itemIndex];
            var valueData = new Map();
            this_1.nameSet.forEach(function (name) {
                var searchKey = searchKeyMap.get(name);
                var value = itemData[searchKey];
                valueData.set(name, value);
            });
            this_1.dataArr.push(valueData);
        };
        var this_1 = this;
        // 数据表从5开始
        for (var itemIndex = 5; itemIndex < tableData.length; itemIndex++) {
            _loop_1(itemIndex);
        }
        this._initSuc = true;
    }
    ExcelObjData.prototype.isInitSuc = function () {
        return this._initSuc;
    };
    return ExcelObjData;
}());
var ExcelParsingData = /** @class */ (function () {
    function ExcelParsingData(excelDirPath, isClient) {
        this.excelTableMap = new Map();
        console.log("开始解析excel目录 " + excelDirPath);
        var createFiles = fs.readdirSync(excelDirPath);
        var tableDatas = {};
        for (var i = 0; i < createFiles.length; i++) {
            var file = createFiles[i];
            if (file.indexOf(".xlsx") !== -1) {
                var baseName = file.substring(0, file.indexOf("."));
                var workbook = xlsx.readFile(excelDirPath + "/" + file); //workbook就是xls文档对象
                var sheetNames = workbook.SheetNames; //获取表名
                var sheet = workbook.Sheets[sheetNames[0]]; //通过表名得到表对象
                tableDatas[baseName] = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json
            }
        }
        for (var key in tableDatas) {
            var tableData = tableDatas[key];
            var excelObjData = new ExcelObjData(tableData, key, isClient);
            this.excelTableMap.set(key, excelObjData);
        }
    }
    return ExcelParsingData;
}());
export { ExcelParsingData };
//# sourceMappingURL=ExcelParsingData.js.map