import { createAndWriteFileSync } from "../common/CommonTool";
import { convertExcelTypeToPbType, ExcelParsingData } from "../common/ExcelParsingData";
import { JypFrameDefine } from "../common/JypFrameDefine";
var pbBeginContet = "syntax = \"proto3\";\npackage excelPb;\n";
export function doExcelToProtoFile(excelParsingData, protoDirPath, protoName) {
    protoName = protoName || "tmpProto";
    var excelPbContent = pbBeginContet;
    var totalTableContent = "message TotalExcelPbDatas{\n";
    var totalIndex = 1;
    var messagePbTableName = JypFrameDefine.messagePbTableNameBegin;
    var messagePbDateName = JypFrameDefine.messagePbDateNameBegin;
    excelParsingData.excelTableMap.forEach(function (tableData, key) {
        var tableName = key.charAt(0).toUpperCase() + key.slice(1);
        var index = 1;
        var messageContent = "message " + messagePbTableName + tableName + "{\n";
        tableData.nameSet.forEach(function (name) {
            var tips = tableData.tipsMap.get(name);
            if (tips) {
                messageContent += "    // " + tips + "\n";
            }
            var type = tableData.typeMap.get(name);
            var pbType = convertExcelTypeToPbType(type);
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
    var pbFilePath = protoDirPath + "/" + protoName + ".proto";
    createAndWriteFileSync(protoDirPath);
    createAndWriteFileSync(pbFilePath, excelPbContent + totalTableContent);
}
export function excelToProtoFile(excelDirPath, protoDirPath) {
    var excelParsingData = new ExcelParsingData(excelDirPath, true);
    doExcelToProtoFile(excelParsingData, protoDirPath);
}
// let protoDirPath: string = __dirname.substring(0, __dirname.lastIndexOf("package-lib")) + "/package-lib/ts/excelToPbTs/tmpProto"
// excelToProtoFile("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", protoDirPath)
//# sourceMappingURL=ExcelToProtoFile.js.map