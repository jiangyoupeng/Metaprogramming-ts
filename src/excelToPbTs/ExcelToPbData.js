// import { ExcelParsingData } from "../common/ExcelParsingData"
import { loadSync } from "protobufjs";
import { createAndWriteFileSync, removeDir } from "../common/CommonTool";
import { convertExcelTypeToTsType } from "../common/ExcelParsingData";
import { JypFrameDefine } from "../common/JypFrameDefine";
export function excelToPbData(excelParsingData, protoFile, pbDataDirPath) {
    var root = loadSync(protoFile);
    var TotalExcelPbDatas = root.lookupType("excelPb.TotalExcelPbDatas");
    var totalDatas = {};
    excelParsingData.excelTableMap.forEach(function (tableData, key) {
        var fileName = key.charAt(0).toUpperCase() + key.slice(1);
        var TableClass = root.lookupType("excelPb." + JypFrameDefine.messagePbTableNameBegin + fileName);
        var tableArrDatas = [];
        tableData.dataArr.forEach(function (oneLineData) {
            var infoData = {};
            oneLineData.forEach(function (oneData, name) {
                var type = tableData.typeMap.get(name);
                var factType = convertExcelTypeToTsType(type);
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
        totalDatas["" + JypFrameDefine.messagePbDateNameBegin + fileName] = tableArrDatas;
    });
    var encodeData = TotalExcelPbDatas.encode(TotalExcelPbDatas.create(totalDatas)).finish();
    removeDir(pbDataDirPath);
    var writePath = pbDataDirPath + "/" + JypFrameDefine.frameCodeCreateExcelDataResName + ".bin";
    createAndWriteFileSync(writePath, encodeData);
}
//# sourceMappingURL=ExcelToPbData.js.map