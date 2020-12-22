// 生成ts脚本和pb数据
import { ExcelParsingData } from "../common/ExcelParsingData";
import { excelToPbData } from "./ExcelToPbData";
import { excelToPbTs } from "./ExcelToPbTs";
import { doExcelToProtoFile } from "./ExcelToProtoFile";
import { JypFrameDefine } from "../common/JypFrameDefine";
import { removeDir } from "../common/CommonTool";
// 生成的临时 proto会删除
export function excelToPbFrame(excelDirPath, projectSriptDir, projectResDir) {
    console.log("当前启用数据框架: pbTs");
    var excelParsingData = new ExcelParsingData(excelDirPath, true);
    // 生成pb文件
    var protoDirPath = __dirname.substring(0, __dirname.lastIndexOf("Metaprogramming-ts")) + "/Metaprogramming-ts/ts/excelToPbTs/tmpProto";
    var protoFilePath = protoDirPath + "/tmpProto.proto";
    removeDir(protoDirPath);
    doExcelToProtoFile(excelParsingData, protoDirPath, "tmpProto");
    var writeDirPath = projectResDir + JypFrameDefine.frameCodeCreateExcelDataResName;
    excelToPbData(excelParsingData, protoFilePath, writeDirPath);
    excelToPbTs(excelParsingData, projectSriptDir, protoDirPath, function () {
        console.log("excelpb 框架代码和数据生成完毕");
        removeDir(protoDirPath);
    });
}
// excelToPbFrame(
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/excel",
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/assets",
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/assets/resources/"
// )
//# sourceMappingURL=excelToPbFrame.js.map