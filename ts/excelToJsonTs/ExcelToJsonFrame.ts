import { ExcelParsingData } from "../common/ExcelParsingData"
import { excelToPbData } from "../excelToPbTs/ExcelToPbData"
import { doCreateTsJsonData } from "./CreateTsJsonData"
import { doCreateTsJsonScript } from "./CreateTsJsonScript"

export function excelToJsonFrame(excelDirPath: string, projectSriptDir: string, projectResDir: string) {
    console.log("当前启用数据框架: jsonTs")
    let excelParsingData = new ExcelParsingData(excelDirPath, true)
    doCreateTsJsonData(excelParsingData, projectResDir)
    doCreateTsJsonScript(excelParsingData, projectSriptDir)
}
// example
// to creator client
// excelToJsonFrame(
//     "youProject/excel",
//     "youProject/assets",
//     "youProject/assets/resources/"
// )
// to node server
// excelToJsonFrame(
//     "youProject/excel",
//     "youProject/",
//     "youProject/resources/"
// )
