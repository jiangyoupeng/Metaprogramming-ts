"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelToProtoFile = exports.doExcelToProtoFile = void 0;
var CommonTool_1 = require("../common/CommonTool");
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
var pbBeginContet = "syntax = \"proto3\";\npackage excelPb;\n";
function doExcelToProtoFile(excelParsingData, protoDirPath, protoName) {
    protoName = protoName || "tmpProto";
    var excelPbContent = pbBeginContet;
    var totalTableContent = "message TotalExcelPbDatas{\n";
    var totalIndex = 1;
    var messagePbTableName = JypFrameDefine_1.JypFrameDefine.messagePbTableNameBegin;
    var messagePbDateName = JypFrameDefine_1.JypFrameDefine.messagePbDateNameBegin;
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
            var pbType = ExcelParsingData_1.convertExcelTypeToPbType(type);
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
    CommonTool_1.createAndWriteFileSync(protoDirPath);
    CommonTool_1.createAndWriteFileSync(pbFilePath, excelPbContent + totalTableContent);
}
exports.doExcelToProtoFile = doExcelToProtoFile;
function excelToProtoFile(excelDirPath, protoDirPath) {
    var excelParsingData = new ExcelParsingData_1.ExcelParsingData(excelDirPath, true);
    doExcelToProtoFile(excelParsingData, protoDirPath);
}
exports.excelToProtoFile = excelToProtoFile;
// let protoDirPath: string = __dirname.substring(0, __dirname.lastIndexOf("package-lib")) + "/package-lib/ts/excelToPbTs/tmpProto"
// excelToProtoFile("F:/creatorProject/creatorPlugin/excel", protoDirPath)
//# sourceMappingURL=ExcelToProtoFile.js.map