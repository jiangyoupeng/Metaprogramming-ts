import { ExcelParsingData } from "../common/ExcelParsingData";
import { doCreateTsJsonData } from "./CreateTsJsonData";
import { doCreateTsJsonScript } from "./CreateTsJsonScript";
export function excelToJsonFrame(excelDirPath, projectSriptDir, projectResDir) {
    console.log("当前启用数据框架: jsonTs");
    var excelParsingData = new ExcelParsingData(excelDirPath, true);
    doCreateTsJsonData(excelParsingData, projectResDir);
    doCreateTsJsonScript(excelParsingData, projectSriptDir);
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
//# sourceMappingURL=ExcelToJsonFrame.js.map