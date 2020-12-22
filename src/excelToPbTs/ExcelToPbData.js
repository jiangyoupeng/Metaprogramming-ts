// import { ExcelParsingData } from "../common/ExcelParsingData"
import { loadSync } from "protobufjs";
import { createAndWriteFileSync, removeDir } from "../common/CommonTool";
import { convertExcelTypeToTsType } from "../common/ExcelParsingData";
import { JypFrameDefine } from "../common/JypFrameDefine";
export function excelToPbData(excelParsingData, protoFile, pbDataDirPath) {
    const root = loadSync(protoFile);
    const TotalExcelPbDatas = root.lookupType(`excelPb.TotalExcelPbDatas`);
    let totalDatas = {};
    excelParsingData.excelTableMap.forEach((tableData, key) => {
        let fileName = key.charAt(0).toUpperCase() + key.slice(1);
        let TableClass = root.lookupType(`excelPb.${JypFrameDefine.messagePbTableNameBegin}${fileName}`);
        let tableArrDatas = [];
        tableData.dataArr.forEach((oneLineData) => {
            let infoData = {};
            oneLineData.forEach((oneData, name) => {
                let type = tableData.typeMap.get(name);
                let factType = convertExcelTypeToTsType(type);
                if (oneData !== undefined && oneData !== null) {
                    if (type.indexOf("[]") !== -1) {
                        let newValue = oneData;
                        newValue = newValue.split("[")[1];
                        newValue = newValue.split("]")[0];
                        let valueDataArr = newValue.split(",");
                        if (factType.indexOf("number") !== -1) {
                            for (let index = 0; index < valueDataArr.length; index++) {
                                valueDataArr[index] = parseFloat(valueDataArr[index]);
                            }
                        }
                        else if (factType.indexOf("boolean") !== -1) {
                            for (let index = 0; index < valueDataArr.length; index++) {
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
        totalDatas[`${JypFrameDefine.messagePbDateNameBegin}${fileName}`] = tableArrDatas;
    });
    let encodeData = TotalExcelPbDatas.encode(TotalExcelPbDatas.create(totalDatas)).finish();
    removeDir(pbDataDirPath);
    let writePath = pbDataDirPath + "/" + JypFrameDefine.frameCodeCreateExcelDataResName + ".bin";
    createAndWriteFileSync(writePath, encodeData);
}
//# sourceMappingURL=ExcelToPbData.js.map