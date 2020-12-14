"use strict";
// 生成ts脚本和pb数据
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelToPbFrame = void 0;
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var ExcelToPbData_1 = require("./ExcelToPbData");
var ExcelToPbTs_1 = require("./ExcelToPbTs");
var ExcelToProtoFile_1 = require("./ExcelToProtoFile");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
var CommonTool_1 = require("../common/CommonTool");
// 生成的临时 proto会删除
function excelToPbFrame(excelDirPath, projectSriptDir, projectResDir) {
    console.log("当前启用数据框架: pbTs");
    var excelParsingData = new ExcelParsingData_1.ExcelParsingData(excelDirPath, true);
    // 生成pb文件
    var protoDirPath = __dirname.substring(0, __dirname.lastIndexOf("package-lib")) + "/package-lib/ts/excelToPbTs/tmpProto";
    var protoFilePath = protoDirPath + "/tmpProto.proto";
    CommonTool_1.removeDir(protoDirPath);
    ExcelToProtoFile_1.doExcelToProtoFile(excelParsingData, protoDirPath, "tmpProto");
    var writeDirPath = projectResDir + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName;
    ExcelToPbData_1.excelToPbData(excelParsingData, protoFilePath, writeDirPath);
    ExcelToPbTs_1.excelToPbTs(excelParsingData, projectSriptDir, protoDirPath, function () {
        console.log("excelpb 框架代码和数据生成完毕");
        CommonTool_1.removeDir(protoDirPath);
    });
}
exports.excelToPbFrame = excelToPbFrame;
// excelToPbFrame(
//     "F:/creatorProject/creatorPlugin/excel",
//     "F:/creatorProject/creatorPlugin/assets",
//     "F:/creatorProject/creatorPlugin/assets/resources/"
// )
//# sourceMappingURL=excelToPbFrame.js.map