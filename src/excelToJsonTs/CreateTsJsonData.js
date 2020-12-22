"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTsJsonData = exports.doCreateTsJsonData = void 0;
var CommonTool_1 = require("../common/CommonTool");
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
var excelDataName = "excelData.json";
function doCreateTsJsonData(excelParsingData, projectResource) {
    // 只支持唯一主键
    var settingJsonData = {};
    var tableDatas = excelParsingData.excelTableMap;
    tableDatas.forEach(function (tableData, key) {
        var fileName = key.charAt(0).toUpperCase() + key.slice(1);
        var tableJsonData = {};
        settingJsonData[fileName] = tableJsonData;
        var ids = [];
        var keys = [];
        var values = [];
        var foreign = {};
        tableData.nameSet.forEach(function (name) {
            keys.push(name);
        });
        tableData.foreignMap.forEach(function (foreignData, name) {
            foreign[name] = { dataType: foreignData.foreignTableName, dataKey: foreignData.foreignKeyName };
        });
        var _loop_1 = function (index) {
            var oneLineData = tableData.dataArr[index];
            var valueData = [];
            oneLineData.forEach(function (oneData, name) {
                var type = tableData.typeMap.get(name);
                var factType = ExcelParsingData_1.convertExcelTypeToTsType(type);
                if (oneData !== undefined && oneData !== null) {
                    if (type.indexOf("[]") !== -1) {
                        var newValue = oneData;
                        newValue = newValue.split("[")[1];
                        newValue = newValue.split("]")[0];
                        var valueDataArr = newValue.split(",");
                        if (factType.indexOf("number") !== -1) {
                            for (var index_1 = 0; index_1 < valueDataArr.length; index_1++) {
                                valueDataArr[index_1] = parseFloat(valueDataArr[index_1]);
                            }
                        }
                        else if (factType.indexOf("boolean") !== -1) {
                            for (var index_2 = 0; index_2 < valueDataArr.length; index_2++) {
                                if (valueDataArr[index_2] === "true") {
                                    valueDataArr[index_2] = true;
                                }
                                else if (valueDataArr[index_2] === "false") {
                                    valueDataArr[index_2] = false;
                                }
                                else {
                                    console.error("error to convert boolean " + valueDataArr[index_2]);
                                }
                            }
                        }
                        oneData = valueDataArr;
                    }
                    else {
                        if (type !== "string") {
                            try {
                                oneData = JSON.parse("[" + oneData + "]")[0];
                            }
                            catch (error) {
                                console.log("错误的解析数据 " + oneData + " 表: " + fileName + " 类型 " + type + " 名字 " + name);
                            }
                        }
                        else {
                            oneData = "" + oneData;
                        }
                    }
                }
                else {
                    oneData = null;
                }
                valueData.push(oneData);
                if (name == tableData.primaryKeyName) {
                    ids.push(oneData);
                }
            });
            values.push(valueData);
        };
        for (var index = 0; index < tableData.dataArr.length; index++) {
            _loop_1(index);
        }
        tableJsonData.ids = ids;
        tableJsonData.keys = keys;
        tableJsonData.values = values;
        tableJsonData.foreign = foreign;
    });
    var writeDirPath = projectResource + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName;
    var writePath = writeDirPath + "/" + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + ".json";
    CommonTool_1.removeDir(writeDirPath);
    CommonTool_1.createAndWriteFileSync(writePath, JSON.stringify(settingJsonData, null, 4));
    console.log("excel转换json数据完成");
}
exports.doCreateTsJsonData = doCreateTsJsonData;
function createTsJsonData(excelDirPath, projectResource) {
    var excelParsingData = new ExcelParsingData_1.ExcelParsingData(excelDirPath, true);
    doCreateTsJsonData(excelParsingData, projectResource);
}
exports.createTsJsonData = createTsJsonData;
// createTsJsonData("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", "F:/creatorProject/creatorPlugin_3_0_0_preview/assets/resources/")
//# sourceMappingURL=CreateTsJsonData.js.map