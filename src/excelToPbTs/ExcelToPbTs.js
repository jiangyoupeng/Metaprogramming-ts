"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelToPbTs = void 0;
var fs = require("fs");
var CommonTool_1 = require("../common/CommonTool");
var CreatePBTs_1 = require("../common/CreatePBTs");
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
var initFuncPath = __dirname.substring(0, __dirname.lastIndexOf("Metaprogramming-ts")) + "/Metaprogramming-ts/ts/excelToPbTs/PbBaseDataManagerInitFunc.ts";
var BaseDataManagerClassName = "BaseDataManager";
var ExcelDataModelsClassName = "ExcelDataModels";
var ExcelDataManagerClassName = "ExcelDataManager";
var excelToPbPath = "/excelToTs";
function excelToPbTs(excelParsingData, projectScriptPath, protoDirPath, overCall) {
    var dataPath = projectScriptPath +
        "/" +
        JypFrameDefine_1.JypFrameDefine.frameScriptBaseDirName +
        "/" +
        excelToPbPath +
        "/" +
        JypFrameDefine_1.JypFrameDefine.frameOverWriteName +
        "/";
    var baseDataPath = projectScriptPath + "/" + JypFrameDefine_1.JypFrameDefine.frameScriptBaseDirName + "/" + excelToPbPath + "/" + JypFrameDefine_1.JypFrameDefine.frameReadonlyName + "/";
    var excelDataModelPath = baseDataPath + ExcelDataModelsClassName + ".ts";
    var pbBaseDataManager = baseDataPath + BaseDataManagerClassName + ".ts";
    var oneTable = " ".repeat(4);
    var twoTable = " ".repeat(8);
    var threeTable = " ".repeat(12);
    var fourTable = " ".repeat(16);
    // 检测多余文件
    var alreadyCreateLogicFile = {};
    if (fs.existsSync(dataPath)) {
        var tmpfiles = fs.readdirSync(dataPath);
        for (var i = 0; i < tmpfiles.length; i++) {
            var file = tmpfiles[i];
            if (file.indexOf(".ts") === file.length - 3) {
                var baseName = file.substring(0, file.indexOf("."));
                if (baseName !== ExcelDataManagerClassName) {
                    alreadyCreateLogicFile[baseName] = true;
                }
            }
        }
    }
    CommonTool_1.removeDir(baseDataPath);
    var messagePbTableName = JypFrameDefine_1.JypFrameDefine.messagePbTableNameBegin;
    var messagePbDateName = JypFrameDefine_1.JypFrameDefine.messagePbDateNameBegin;
    var noModifyTips = JypFrameDefine_1.JypFrameDefine.noModifyTips;
    var canModifyTips = JypFrameDefine_1.JypFrameDefine.canModifyTips;
    var initFuncContent = fs.readFileSync(initFuncPath).toString();
    initFuncContent = initFuncContent.substring(initFuncContent.indexOf("    private _init: boolean = false"));
    initFuncContent = initFuncContent.replace("youProjectExcelRes", JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + "/" + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + ".bin");
    var _doInitConent = "let data: excelPb.TotalExcelPbDatas = excelPb.TotalExcelPbDatas.decode(uIntPbData)\n";
    var pbBaseDataManagerContent = "import { loader } from \"cc\"\n";
    pbBaseDataManagerContent += "export class BaseDataManager {\n";
    var content = "import { excelPb } from \"./excelPb\"\n";
    excelParsingData.excelTableMap.forEach(function (tableData, key) {
        var fileName = key.charAt(0).toUpperCase() + key.slice(1);
        var dataName = key.charAt(0).toLowerCase() + key.slice(1);
        var className = "Base" + fileName;
        var logicClassName = fileName;
        var classContentStr = "export class " + className + " {\n";
        classContentStr += "    constructor(excelData: excelPb.I" + messagePbTableName + fileName + ") {\n        this._excelData = excelData\n    }\n";
        classContentStr += "    private _excelData: excelPb.I" + messagePbTableName + fileName + "\n";
        classContentStr += "    private _handlePbExcelDataManager: any\n";
        classContentStr += "    set handlePbExcelDataManager(value: any) {\n";
        classContentStr += "        this._handlePbExcelDataManager = value\n";
        classContentStr += "    }\n";
        tableData.nameSet.forEach(function (name) {
            var tips = tableData.tipsMap.get(name);
            var attritubeStr = "";
            if (tips) {
                attritubeStr = attritubeStr + "    /**\n";
                attritubeStr = attritubeStr + "    * " + tips + "\n";
                attritubeStr = attritubeStr + "    * @memberof " + className + "\n";
                attritubeStr = attritubeStr + "    */\n";
            }
            var type = tableData.typeMap.get(name);
            var tsType = ExcelParsingData_1.convertExcelTypeToTsType(type);
            var foreignMap = tableData.foreignMap.get(name);
            if (foreignMap) {
                var tableKey = foreignMap.foreignTableName;
                var tableDataKey = tableKey.charAt(0).toLowerCase() + tableKey.slice(1);
                var baseKey = "Base" + tableKey;
                var useType = baseKey;
                if (tsType.indexOf("[]") !== -1) {
                    useType = baseKey + "[]";
                }
                var cachName = "cach" + name.charAt(0).toUpperCase() + name.slice(1);
                attritubeStr = oneTable + "private " + cachName + ": " + useType + " = null\n" + attritubeStr;
                attritubeStr = "" + attritubeStr + oneTable + "get " + name + "(): " + useType + " {\n" + twoTable;
                attritubeStr += "if (!this." + cachName + ") {\n";
                if (tsType.indexOf("[]") !== -1) {
                    attritubeStr += threeTable + "this." + cachName + " = []\n";
                    attritubeStr += threeTable + "let searchData = this._handlePbExcelDataManager." + tableDataKey + "\n";
                    attritubeStr += threeTable + "this._excelData." + name + ".forEach((data) => {\n";
                    attritubeStr += fourTable + "this." + cachName + ".push(searchData[data])\n";
                    attritubeStr += threeTable + "})\n";
                }
                else {
                    attritubeStr += threeTable + "this." + cachName + " = this._handlePbExcelDataManager." + tableDataKey + "[this._excelData." + name + "]\n";
                }
                attritubeStr += twoTable + "}\n" + twoTable + "return this." + cachName + "\n" + oneTable + "}\n";
            }
            else {
                attritubeStr = "" + attritubeStr + oneTable + "get " + name + "(): " + tsType + " {\n" + twoTable + "return this._excelData." + name + "\n" + oneTable + "}\n";
            }
            classContentStr += attritubeStr;
        });
        var uniqueStr = "";
        uniqueStr = uniqueStr + "    /**\n";
        uniqueStr = uniqueStr + "    * 当前主键数据\n";
        uniqueStr = uniqueStr + "    * @memberof " + className + "\n";
        uniqueStr = uniqueStr + "    */\n";
        uniqueStr = uniqueStr + "    get uniqueKeyData() {\n";
        uniqueStr = uniqueStr + "        return this." + tableData.primaryKeyName + "\n";
        uniqueStr = uniqueStr + "    }\n";
        uniqueStr = uniqueStr + "    /**\n";
        uniqueStr = uniqueStr + "    * 主键\n";
        uniqueStr = uniqueStr + "    * @memberof " + className + "\n";
        uniqueStr = uniqueStr + "    */\n";
        uniqueStr = uniqueStr + "    static readonly uniqueKeyName: string = '" + tableData.primaryKeyName + "'\n";
        classContentStr += uniqueStr + "}\n";
        content += classContentStr;
        pbBaseDataManagerContent += oneTable + dataName + ": {[key: string]: " + logicClassName + "} = {}\n";
        pbBaseDataManagerContent =
            "import { " +
                logicClassName +
                " } from '../" +
                JypFrameDefine_1.JypFrameDefine.frameOverWriteName +
                "/" +
                logicClassName +
                "'\n" +
                pbBaseDataManagerContent;
        var logicFilePath = dataPath + logicClassName + ".ts";
        if (!fs.existsSync(logicFilePath)) {
            var logicFileStr = canModifyTips +
                "import { " +
                className +
                " } from '../" +
                JypFrameDefine_1.JypFrameDefine.frameReadonlyName +
                "/" +
                ExcelDataModelsClassName +
                "'\n";
            logicFileStr = logicFileStr + "export class " + logicClassName + " extends " + className + " {\n}";
            CommonTool_1.createAndWriteFileSync(logicFilePath, logicFileStr);
        }
        if (alreadyCreateLogicFile[logicClassName]) {
            alreadyCreateLogicFile[logicClassName] = false;
        }
        _doInitConent += twoTable + "data." + messagePbDateName + fileName + ".forEach((data) => {\n";
        _doInitConent += threeTable + "let pbData = new " + logicClassName + "(data)\n";
        _doInitConent += threeTable + "pbData.handlePbExcelDataManager = this\n";
        _doInitConent += threeTable + "this." + dataName + "[pbData.uniqueKeyData] = pbData\n";
        _doInitConent += twoTable + "})\n";
    });
    for (var key in alreadyCreateLogicFile) {
        if (alreadyCreateLogicFile[key]) {
            console.warn("该逻辑代码文件:" + key + " 不存在excel表格中,请确认是否需要");
        }
    }
    initFuncContent = initFuncContent.replace("\"replace you _doInitData imm\"", _doInitConent);
    pbBaseDataManagerContent += initFuncContent;
    pbBaseDataManagerContent = "import { excelPb } from \"./excelPb\"\n" + pbBaseDataManagerContent;
    // console.log(content)
    CommonTool_1.createAndWriteFileSync(excelDataModelPath, noModifyTips + content);
    CommonTool_1.createAndWriteFileSync(pbBaseDataManager, noModifyTips + pbBaseDataManagerContent);
    var pbExcelDataContent = canModifyTips +
        ("import { " + BaseDataManagerClassName + " } from '../readonly/" + BaseDataManagerClassName + "'\nexport class ExcelDataManager extends " + BaseDataManagerClassName + " {}");
    CommonTool_1.createAndWriteFileSync(dataPath + ExcelDataManagerClassName + ".ts", pbExcelDataContent);
    CommonTool_1.createAndWriteFileSync(baseDataPath);
    CreatePBTs_1.createPbts(baseDataPath, protoDirPath, "excelPb", "es6", function () {
        // 通过将protobufjs 导入项目为插件的方式 解决es6调用commonjs的问题
        var data = fs.readFileSync(baseDataPath + "/excelPb.js");
        var content = data.toString();
        content = content.replace("import * as $protobuf from \"protobufjs/minimal\"", "const $protobuf = protobuf");
        CommonTool_1.createAndWriteFileSync(baseDataPath + "/excelPb.js", content);
        console.log("替换excelPb内容成功");
        if (overCall) {
            overCall();
        }
    });
}
exports.excelToPbTs = excelToPbTs;
// excelToPbTs("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", "F:/creatorProject/creatorPlugin_3_0_0_preview/assets")
//# sourceMappingURL=ExcelToPbTs.js.map