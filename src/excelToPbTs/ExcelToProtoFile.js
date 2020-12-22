import { createAndWriteFileSync } from "../common/CommonTool";
import { convertExcelTypeToPbType, ExcelParsingData } from "../common/ExcelParsingData";
import { JypFrameDefine } from "../common/JypFrameDefine";
const pbBeginContet = `syntax = "proto3";
package excelPb;
`;
export function doExcelToProtoFile(excelParsingData, protoDirPath, protoName) {
    protoName = protoName || "tmpProto";
    let excelPbContent = pbBeginContet;
    let totalTableContent = "message TotalExcelPbDatas{\n";
    let totalIndex = 1;
    let messagePbTableName = JypFrameDefine.messagePbTableNameBegin;
    let messagePbDateName = JypFrameDefine.messagePbDateNameBegin;
    excelParsingData.excelTableMap.forEach((tableData, key) => {
        let tableName = key.charAt(0).toUpperCase() + key.slice(1);
        let index = 1;
        let messageContent = "message " + messagePbTableName + tableName + "{\n";
        tableData.nameSet.forEach((name) => {
            let tips = tableData.tipsMap.get(name);
            if (tips) {
                messageContent += "    // " + tips + "\n";
            }
            let type = tableData.typeMap.get(name);
            let pbType = convertExcelTypeToPbType(type);
            if (pbType.indexOf("[]") !== -1) {
                pbType = pbType.substr(0, pbType.indexOf("[]"));
                messageContent = messageContent + "    repeated " + pbType + " " + name + " = " + index++ + " [packed=true];\n";
            }
            else {
                messageContent = messageContent + "    " + pbType + " " + name + " = " + index++ + ";\n";
            }
        });
        messageContent += "}\n";
        excelPbContent += messageContent;
        totalTableContent +=
            "    repeated " +
                messagePbTableName +
                tableName +
                " " +
                messagePbDateName +
                tableName +
                "= " +
                totalIndex++ +
                " [packed=true];\n";
    });
    totalTableContent += "}\n";
    let pbFilePath = protoDirPath + "/" + protoName + ".proto";
    createAndWriteFileSync(protoDirPath);
    createAndWriteFileSync(pbFilePath, excelPbContent + totalTableContent);
}
export function excelToProtoFile(excelDirPath, protoDirPath) {
    let excelParsingData = new ExcelParsingData(excelDirPath, true);
    doExcelToProtoFile(excelParsingData, protoDirPath);
}
// let protoDirPath: string = __dirname.substring(0, __dirname.lastIndexOf("package-lib")) + "/package-lib/ts/excelToPbTs/tmpProto"
// excelToProtoFile("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", protoDirPath)
//# sourceMappingURL=ExcelToProtoFile.js.map