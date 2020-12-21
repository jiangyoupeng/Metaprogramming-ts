"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTsJsonScript = exports.doCreateTsJsonScript = void 0;
var fs = require("fs");
var CommonTool_1 = require("../common/CommonTool");
var ExcelParsingData_1 = require("../common/ExcelParsingData");
var JypFrameDefine_1 = require("../common/JypFrameDefine");
var excelToTsPath = "/excelToTs";
var initFuncPath = __dirname.substring(0, __dirname.lastIndexOf("Metaprogramming-ts")) + "/Metaprogramming-ts/ts/excelToJsonTs/BaseDataManagerInitFunc.ts";
var RefrenceClassName = "Refrence";
var BaseDataManagerClassName = "BaseDataManager";
var ExcelDataModelsClassName = "ExcelDataModels";
var ExcelDataManagerClassName = "ExcelDataManager";
function doCreateTsJsonScript(excelParsingData, projectScriptPath) {
    var dataPath = projectScriptPath +
        "/" +
        JypFrameDefine_1.JypFrameDefine.frameScriptBaseDirName +
        "/" +
        excelToTsPath +
        "/" +
        JypFrameDefine_1.JypFrameDefine.frameOverWriteName +
        "/";
    var baseDataPath = projectScriptPath + "/" + JypFrameDefine_1.JypFrameDefine.frameScriptBaseDirName + "/" + excelToTsPath + "/" + JypFrameDefine_1.JypFrameDefine.frameReadonlyName + "/";
    var excelDataModelPath = baseDataPath + ExcelDataModelsClassName + ".ts";
    CommonTool_1.removeDir(baseDataPath);
    var noModifyTips = JypFrameDefine_1.JypFrameDefine.noModifyTips;
    var canModifyTips = JypFrameDefine_1.JypFrameDefine.canModifyTips;
    // 第 1行是描述,第二行说明服务器还是客户端使用
    // 第3行开始有用 说明类型
    // 第4行说明字段名
    var totalBaseSettingModelStr = "";
    var refrenceFileStr = "";
    var refrenceContentStr = "export class " + RefrenceClassName + " {\n";
    var settingDataModelContetnt = "export class " + BaseDataManagerClassName + " {\n";
    // 只支持唯一主键
    var tableDatas = excelParsingData.excelTableMap;
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
    tableDatas.forEach(function (tableData, key) {
        var fileName = key.charAt(0).toUpperCase() + key.slice(1);
        var className = "Base" + fileName;
        var logicClassName = fileName;
        var classContentBeginStr = "export class " + className + " {\n";
        var classContentStr = "";
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
                var baseKey = "Base" + tableKey;
                if (tsType.indexOf("[]") !== -1) {
                    attritubeStr += "    readonly " + name + ": " + baseKey + "[] = null\n";
                }
                else {
                    attritubeStr += "    readonly " + name + ": " + baseKey + " = null\n";
                }
            }
            else {
                attritubeStr += "    readonly " + name + ": " + tsType + " = null\n";
            }
            classContentStr = classContentStr + attritubeStr;
        });
        var uniqueStr = "";
        uniqueStr = uniqueStr + "    get uniqueKeyData() {\n";
        uniqueStr = uniqueStr + "        return this." + tableData.primaryKeyName + "\n";
        uniqueStr = uniqueStr + "    }\n";
        uniqueStr = uniqueStr + "    static readonly uniqueKeyName: string = '" + tableData.primaryKeyName + "'\n";
        classContentStr = classContentBeginStr + uniqueStr + classContentStr + "}";
        totalBaseSettingModelStr += classContentStr + "\n";
        refrenceFileStr =
            "import { " +
                logicClassName +
                " } from '../" +
                JypFrameDefine_1.JypFrameDefine.frameOverWriteName +
                "/" +
                logicClassName +
                "'\n" +
                refrenceFileStr;
        refrenceContentStr = refrenceContentStr + "    static readonly " + logicClassName + " = " + logicClassName + "\n";
        settingDataModelContetnt = settingDataModelContetnt + "    " + logicClassName + ": {[key: string]: " + logicClassName + "} = {}\n";
        var logicFilePath = dataPath + logicClassName + ".ts";
        // 逻辑文件不可覆写
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
    });
    for (var key in alreadyCreateLogicFile) {
        if (alreadyCreateLogicFile[key]) {
            console.warn("该逻辑代码文件:" + key + " 不存在excel表格中,请确认是否需要");
        }
    }
    refrenceContentStr = refrenceContentStr + "}";
    settingDataModelContetnt = "import { " + RefrenceClassName + " } from './" + RefrenceClassName + "'\n" + settingDataModelContetnt;
    settingDataModelContetnt = "import { loader, JsonAsset } from \"cc\"\n" + settingDataModelContetnt;
    var data = fs.readFileSync(initFuncPath).toString();
    data = data.substring(data.indexOf("    private _init: boolean = false"));
    data = data.replace("youProjectExcelRes", JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + "/" + JypFrameDefine_1.JypFrameDefine.frameCodeCreateExcelDataResName + ".json");
    settingDataModelContetnt += data;
    CommonTool_1.createAndWriteFileSync(baseDataPath + RefrenceClassName + ".ts", noModifyTips + refrenceFileStr + refrenceContentStr);
    CommonTool_1.createAndWriteFileSync(baseDataPath + BaseDataManagerClassName + ".ts", noModifyTips + refrenceFileStr + settingDataModelContetnt);
    var settingPath = dataPath + ExcelDataManagerClassName + ".ts";
    if (!fs.existsSync(settingPath)) {
        var settingDataStr = canModifyTips +
            "import { " +
            BaseDataManagerClassName +
            " } from '../" +
            JypFrameDefine_1.JypFrameDefine.frameReadonlyName +
            "/" +
            BaseDataManagerClassName +
            "'\n" +
            "export class " +
            ExcelDataManagerClassName +
            " extends " +
            BaseDataManagerClassName +
            " {\n" +
            "}\n";
        CommonTool_1.createAndWriteFileSync(settingPath, settingDataStr);
    }
    CommonTool_1.createAndWriteFileSync(excelDataModelPath, noModifyTips + totalBaseSettingModelStr);
    console.log("脚本代码自动生成完毕");
}
exports.doCreateTsJsonScript = doCreateTsJsonScript;
function createTsJsonScript(excelDirPath, projectScriptPath) {
    var excelParsingData = new ExcelParsingData_1.ExcelParsingData(excelDirPath, true);
    doCreateTsJsonScript(excelParsingData, projectScriptPath);
}
exports.createTsJsonScript = createTsJsonScript;
// createTsJsonScript("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", "F:/creatorProject/creatorPlugin_3_0_0_preview/assets")
//# sourceMappingURL=CreateTsJsonScript.js.map