"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelToPbData = void 0;
// import { ExcelParsingData } from "../common/ExcelParsingData"
var protobufjs_1 = require("protobufjs");
var CommonTool_1 = require("../common/CommonTool");
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
function excelToPbData(excelParsingData, protoFile, pbDataDirPath) {
    var root = protobufjs_1.loadSync(protoFile);
    var TotalExcelPbDatas = root.lookupType("excelPb.TotalExcelPbDatas");
    var totalDatas = {};
    excelParsingData.excelTableMap.forEach(function (tableData, key) {
        var fileName = key.charAt(0).toUpperCase() + key.slice(1);
        var TableClass = root.lookupType("excelPb." + JypFrameDefine_1.JypFrameDefine.messagePbTableNameBegin + fileName);
        var tableArrDatas = [];
        tableData.dataArr.forEach(function (oneLineData) {
            var infoData = {};
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
                            for (var index = 0; index < valueDataArr.length; index++) {
                                valueDataArr[index] = parseFloat(valueDataArr[index]);
                            }
                        }
                        else if (factType.indexOf("boolean") !== -1) {
                            for (var index = 0; index < valueDataArr.length; index++) {
                                if (valueDataArr[index] === "true") {
                                    valueDataArr[index] = true;
                                }
                                else if (valueDataArr[index] === "false") {
                                    valueDataArr[index] = false;
                                }
                                else {
                                    console.error("error to convert boolean " + valueDataArr[index]);
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
                infoData[name] = oneData;
            });
            tableArrDatas.push(infoData);
        });
        totalDatas["" + JypFrameDefine_1.JypFrameDefine.messagePbDateNameBegin + fileName] = tableArrDatas;
    });
    var encodeData = TotalExcelPbDatas.encode(TotalExcelPbDatas.create(totalDatas)).finish();
    CommonTool_1.removeDir(pbDataDirPath);
    var writePath = pbDataDirPath + "/" + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + ".bin";
    CommonTool_1.createAndWriteFileSync(writePath, encodeData);
}
exports.excelToPbData = excelToPbData;
//# sourceMappingURL=ExcelToPbData.js.map