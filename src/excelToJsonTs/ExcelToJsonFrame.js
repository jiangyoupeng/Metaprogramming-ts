"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelToJsonFrame = void 0;
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var CreateTsJsonData_1 = require("./CreateTsJsonData");
var CreateTsJsonScript_1 = require("./CreateTsJsonScript");
function excelToJsonFrame(excelDirPath, projectSriptDir, projectResDir) {
    console.log("当前启用数据框架: jsonTs");
    var excelParsingData = new ExcelParsingData_1.ExcelParsingData(excelDirPath, true);
    CreateTsJsonData_1.doCreateTsJsonData(excelParsingData, projectResDir);
    CreateTsJsonScript_1.doCreateTsJsonScript(excelParsingData, projectSriptDir);
}
exports.excelToJsonFrame = excelToJsonFrame;
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