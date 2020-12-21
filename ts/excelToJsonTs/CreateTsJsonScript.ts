import * as fs from "fs"
import { createAndWriteFileSync, removeDir } from "../common/CommonTool"
import { convertExcelTypeToTsType, ExcelParsingData } from "../common/ExcelParsingData"
import { JypFrameDefine } from "../common/JypFrameDefine"
let excelToTsPath = "/excelToTs"

let initFuncPath: string =
    __dirname.substring(0, __dirname.lastIndexOf("Metaprogramming-ts")) + "/Metaprogramming-ts/ts/excelToJsonTs/BaseDataManagerInitFunc.ts"

const RefrenceClassName = "Refrence"
const BaseDataManagerClassName = "BaseDataManager"
const ExcelDataModelsClassName = "ExcelDataModels"
const ExcelDataManagerClassName = "ExcelDataManager"

export function doCreateTsJsonScript(excelParsingData: ExcelParsingData, projectScriptPath: string) {
    let dataPath =
        projectScriptPath +
        "/" +
        JypFrameDefine.frameScriptBaseDirName +
        "/" +
        excelToTsPath +
        "/" +
        JypFrameDefine.frameOverWriteName +
        "/"
    let baseDataPath =
        projectScriptPath + "/" + JypFrameDefine.frameScriptBaseDirName + "/" + excelToTsPath + "/" + JypFrameDefine.frameReadonlyName + "/"
    let excelDataModelPath = baseDataPath + ExcelDataModelsClassName + ".ts"

    removeDir(baseDataPath)

    let noModifyTips = JypFrameDefine.noModifyTips
    let canModifyTips = JypFrameDefine.canModifyTips

    // 第 1行是描述,第二行说明服务器还是客户端使用
    // 第3行开始有用 说明类型
    // 第4行说明字段名
    let totalBaseSettingModelStr = ""
    let refrenceFileStr = ""
    let refrenceContentStr = "export class " + RefrenceClassName + " {\n"
    let settingDataModelContetnt = "export class " + BaseDataManagerClassName + " {\n"

    // 只支持唯一主键
    let tableDatas = excelParsingData.excelTableMap

    // 检测多余文件
    let alreadyCreateLogicFile = {}
    if (fs.existsSync(dataPath)) {
        let tmpfiles = fs.readdirSync(dataPath)
        for (let i = 0; i < tmpfiles.length; i++) {
            let file = tmpfiles[i]
            if (file.indexOf(".ts") === file.length - 3) {
                let baseName = file.substring(0, file.indexOf("."))
                if (baseName !== ExcelDataManagerClassName) {
                    alreadyCreateLogicFile[baseName] = true
                }
            }
        }
    }

    tableDatas.forEach((tableData, key) => {
        let fileName = key.charAt(0).toUpperCase() + key.slice(1)

        let className = "Base" + fileName
        let logicClassName = fileName
        let classContentBeginStr = "export class " + className + " {\n"
        let classContentStr = ""

        tableData.nameSet.forEach((name) => {
            let tips = tableData.tipsMap.get(name)
            let attritubeStr = ""
            if (tips) {
                attritubeStr = attritubeStr + "    /**\n"
                attritubeStr = attritubeStr + "    * " + tips + "\n"
                attritubeStr = attritubeStr + "    * @memberof " + className + "\n"
                attritubeStr = attritubeStr + "    */\n"
            }
            let type = tableData.typeMap.get(name)
            let tsType = convertExcelTypeToTsType(type)
            let foreignMap = tableData.foreignMap.get(name)
            if (foreignMap) {
                let tableKey = foreignMap.foreignTableName
                let baseKey = "Base" + tableKey
                if (tsType.indexOf("[]") !== -1) {
                    attritubeStr += "    readonly " + name + ": " + baseKey + "[] = null\n"
                } else {
                    attritubeStr += "    readonly " + name + ": " + baseKey + " = null\n"
                }
            } else {
                attritubeStr += "    readonly " + name + ": " + tsType + " = null\n"
            }
            classContentStr = classContentStr + attritubeStr
        })

        let uniqueStr = ""
        uniqueStr = uniqueStr + "    get uniqueKeyData() {\n"
        uniqueStr = uniqueStr + "        return this." + tableData.primaryKeyName + "\n"
        uniqueStr = uniqueStr + "    }\n"
        uniqueStr = uniqueStr + "    static readonly uniqueKeyName: string = '" + tableData.primaryKeyName + "'\n"

        classContentStr = classContentBeginStr + uniqueStr + classContentStr + "}"
        totalBaseSettingModelStr += classContentStr + "\n"

        refrenceFileStr =
            "import { " +
            logicClassName +
            " } from '../" +
            JypFrameDefine.frameOverWriteName +
            "/" +
            logicClassName +
            "'\n" +
            refrenceFileStr
        refrenceContentStr = refrenceContentStr + "    static readonly " + logicClassName + " = " + logicClassName + "\n"
        settingDataModelContetnt = settingDataModelContetnt + "    " + logicClassName + ": {[key: string]: " + logicClassName + "} = {}\n"
        let logicFilePath = dataPath + logicClassName + ".ts"
        // 逻辑文件不可覆写
        if (!fs.existsSync(logicFilePath)) {
            let logicFileStr =
                canModifyTips +
                "import { " +
                className +
                " } from '../" +
                JypFrameDefine.frameReadonlyName +
                "/" +
                ExcelDataModelsClassName +
                "'\n"
            logicFileStr = logicFileStr + "export class " + logicClassName + " extends " + className + " {\n}"
            createAndWriteFileSync(logicFilePath, logicFileStr)
        }
        if (alreadyCreateLogicFile[logicClassName]) {
            alreadyCreateLogicFile[logicClassName] = false
        }
    })

    for (const key in alreadyCreateLogicFile) {
        if (alreadyCreateLogicFile[key]) {
            console.warn("该逻辑代码文件:" + key + " 不存在excel表格中,请确认是否需要")
        }
    }

    refrenceContentStr = refrenceContentStr + "}"
    settingDataModelContetnt = `import { ` + RefrenceClassName + ` } from './` + RefrenceClassName + `'\n` + settingDataModelContetnt
    settingDataModelContetnt = `import { loader, JsonAsset } from "cc"\n` + settingDataModelContetnt

    let data = fs.readFileSync(initFuncPath).toString()
    data = data.substring(data.indexOf("    private _init: boolean = false"))
    data = data.replace(
        "youProjectExcelRes",
        JypFrameDefine.frameCodeCreateExcelDataResName + "/" + JypFrameDefine.frameCodeCreateExcelDataResName + ".json"
    )
    settingDataModelContetnt += data
    createAndWriteFileSync(baseDataPath + RefrenceClassName + ".ts", noModifyTips + refrenceFileStr + refrenceContentStr)
    createAndWriteFileSync(baseDataPath + BaseDataManagerClassName + ".ts", noModifyTips + refrenceFileStr + settingDataModelContetnt)
    let settingPath = dataPath + ExcelDataManagerClassName + ".ts"
    if (!fs.existsSync(settingPath)) {
        let settingDataStr =
            canModifyTips +
            `import { ` +
            BaseDataManagerClassName +
            ` } from '../` +
            JypFrameDefine.frameReadonlyName +
            `/` +
            BaseDataManagerClassName +
            `'\n` +
            `export class ` +
            ExcelDataManagerClassName +
            ` extends ` +
            BaseDataManagerClassName +
            ` {\n` +
            `}\n`
        createAndWriteFileSync(settingPath, settingDataStr)
    }
    createAndWriteFileSync(excelDataModelPath, noModifyTips + totalBaseSettingModelStr)
    console.log("脚本代码自动生成完毕")
}

export function createTsJsonScript(excelDirPath: string, projectScriptPath: string) {
    let excelParsingData = new ExcelParsingData(excelDirPath, true)
    doCreateTsJsonScript(excelParsingData, projectScriptPath)
}

// createTsJsonScript("F:/creatorProject/creatorPlugin_3_0_0_preview/excel", "F:/creatorProject/creatorPlugin_3_0_0_preview/assets")
