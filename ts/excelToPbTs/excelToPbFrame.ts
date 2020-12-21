// 生成ts脚本和pb数据

import { ExcelParsingData } from "../common/ExcelParsingData"
import { excelToPbData } from "./ExcelToPbData"
import { excelToPbTs } from "./ExcelToPbTs"
import { doExcelToProtoFile } from "./ExcelToProtoFile"
import { JypFrameDefine } from "../common/JypFrameDefine"
import { removeDir } from "../common/CommonTool"

// 生成的临时 proto会删除
export function excelToPbFrame(excelDirPath: string, projectSriptDir: string, projectResDir: string) {
    console.log("当前启用数据框架: pbTs")

    let excelParsingData = new ExcelParsingData(excelDirPath, true)
    // 生成pb文件
    let protoDirPath: string =
        __dirname.substring(0, __dirname.lastIndexOf("Metaprogramming-ts")) + "/Metaprogramming-ts/ts/excelToPbTs/tmpProto"
    let protoFilePath: string = protoDirPath + "/tmpProto.proto"
    removeDir(protoDirPath)
    doExcelToProtoFile(excelParsingData, protoDirPath, "tmpProto")

    let writeDirPath = projectResDir + JypFrameDefine.frameCodeCreateExcelDataResName
    excelToPbData(excelParsingData, protoFilePath, writeDirPath)
    excelToPbTs(excelParsingData, projectSriptDir, protoDirPath, () => {
        console.log("excelpb 框架代码和数据生成完毕")
        removeDir(protoDirPath)
    })
}
// excelToPbFrame(
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/excel",
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/assets",
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/assets/resources/"
// )
