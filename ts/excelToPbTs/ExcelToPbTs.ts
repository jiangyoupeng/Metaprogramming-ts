import * as fs from "fs"
import { createAndWriteFileSync, removeDir } from "../common/CommonTool"
import { createPbts } from "../common/CreatePBTs"
import { convertExcelTypeToTsType, ExcelParsingData } from "../common/ExcelParsingData"
import { JypFrameDefine } from "../common/JypFrameDefine"

let initFuncPath: string =
    __dirname.substring(0, __dirname.lastIndexOf("package-lib")) + "/package-lib/ts/excelToPbTs/PbBaseDataManagerInitFunc.ts"
const BaseDataManagerClassName = "BaseDataManager"
const ExcelDataModelsClassName = "ExcelDataModels"
const ExcelDataManagerClassName = "ExcelDataManager"
let excelToPbPath = "/excelToTs"
export function excelToPbTs(excelParsingData: ExcelParsingData, projectScriptPath: string, protoDirPath: string, overCall: Function) {
    let dataPath =
        projectScriptPath +
        "/" +
        JypFrameDefine.frameScriptBaseDirName +
        "/" +
        excelToPbPath +
        "/" +
        JypFrameDefine.frameOverWriteName +
        "/"
    let baseDataPath =
        projectScriptPath + "/" + JypFrameDefine.frameScriptBaseDirName + "/" + excelToPbPath + "/" + JypFrameDefine.frameReadonlyName + "/"
    let excelDataModelPath = baseDataPath + ExcelDataModelsClassName + ".ts"
    let pbBaseDataManager = baseDataPath + BaseDataManagerClassName + ".ts"

    let oneTable = " ".repeat(4)
    let twoTable = " ".repeat(8)
    let threeTable = " ".repeat(12)
    let fourTable = " ".repeat(16)

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
    removeDir(baseDataPath)

    let messagePbTableName = JypFrameDefine.messagePbTableNameBegin
    let messagePbDateName = JypFrameDefine.messagePbDateNameBegin
    let noModifyTips = JypFrameDefine.noModifyTips
    let canModifyTips = JypFrameDefine.canModifyTips

    let initFuncContent = fs.readFileSync(initFuncPath).toString()
    initFuncContent = initFuncContent.substring(initFuncContent.indexOf("    private _init: boolean = false"))
    initFuncContent = initFuncContent.replace(
        "youProjectExcelRes",
        JypFrameDefine.frameCodeCreateExcelDataResName + "/" + JypFrameDefine.frameCodeCreateExcelDataResName + ".bin"
    )

    let _doInitConent = `let data: excelPb.TotalExcelPbDatas = excelPb.TotalExcelPbDatas.decode(uIntPbData)\n`

    let pbBaseDataManagerContent = `import { loader } from "cc"\n`
    pbBaseDataManagerContent += "export class BaseDataManager {\n"
    let content = `import { excelPb } from "./excelPb"\n`
    excelParsingData.excelTableMap.forEach((tableData, key) => {
        let fileName = key.charAt(0).toUpperCase() + key.slice(1)
        let dataName = key.charAt(0).toLowerCase() + key.slice(1)
        let className = "Base" + fileName
        let logicClassName = fileName
        let classContentStr = "export class " + className + " {\n"
        classContentStr += `    constructor(excelData: excelPb.I${messagePbTableName}${fileName}) {
        this._excelData = excelData
    }\n`

        classContentStr += "    private _excelData: excelPb.I" + messagePbTableName + fileName + "\n"
        classContentStr += "    private _handlePbExcelDataManager: any\n"
        classContentStr += "    set handlePbExcelDataManager(value: any) {\n"
        classContentStr += "        this._handlePbExcelDataManager = value\n"
        classContentStr += "    }\n"
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
                let tableDataKey = tableKey.charAt(0).toLowerCase() + tableKey.slice(1)
                let baseKey = "Base" + tableKey
                let useType = baseKey
                if (tsType.indexOf("[]") !== -1) {
                    useType = baseKey + "[]"
                }
                let cachName = "cach" + name.charAt(0).toUpperCase() + name.slice(1)
                attritubeStr = oneTable + `private ` + cachName + ": " + useType + " = null\n" + attritubeStr
                attritubeStr = `${attritubeStr}${oneTable}get ${name}(): ${useType} {\n${twoTable}`
                attritubeStr += `if (!this.${cachName}) {\n`
                if (tsType.indexOf("[]") !== -1) {
                    attritubeStr += `${threeTable}this.${cachName} = []\n`
                    attritubeStr += `${threeTable}let searchData = this._handlePbExcelDataManager.${tableDataKey}\n`
                    attritubeStr += `${threeTable}this._excelData.${name}.forEach((data) => {\n`
                    attritubeStr += `${fourTable}this.${cachName}.push(searchData[data])\n`
                    attritubeStr += `${threeTable}})\n`
                } else {
                    attritubeStr += `${threeTable}this.${cachName} = this._handlePbExcelDataManager.${tableDataKey}[this._excelData.${name}]\n`
                }
                attritubeStr += `${twoTable}}\n${twoTable}return this.${cachName}\n${oneTable}}\n`
            } else {
                attritubeStr = `${attritubeStr}${oneTable}get ${name}(): ${tsType} {\n${twoTable}return this._excelData.${name}\n${oneTable}}\n`
            }
            classContentStr += attritubeStr
        })
        let uniqueStr = ""
        uniqueStr = uniqueStr + "    /**\n"
        uniqueStr = uniqueStr + "    * 当前主键数据\n"
        uniqueStr = uniqueStr + "    * @memberof " + className + "\n"
        uniqueStr = uniqueStr + "    */\n"
        uniqueStr = uniqueStr + "    get uniqueKeyData() {\n"
        uniqueStr = uniqueStr + "        return this." + tableData.primaryKeyName + "\n"
        uniqueStr = uniqueStr + "    }\n"
        uniqueStr = uniqueStr + "    /**\n"
        uniqueStr = uniqueStr + "    * 主键\n"
        uniqueStr = uniqueStr + "    * @memberof " + className + "\n"
        uniqueStr = uniqueStr + "    */\n"
        uniqueStr = uniqueStr + "    static readonly uniqueKeyName: string = '" + tableData.primaryKeyName + "'\n"

        classContentStr += uniqueStr + "}\n"
        content += classContentStr

        pbBaseDataManagerContent += oneTable + dataName + ": {[key: string]: " + logicClassName + "} = {}\n"
        pbBaseDataManagerContent =
            "import { " +
            logicClassName +
            " } from '../" +
            JypFrameDefine.frameOverWriteName +
            "/" +
            logicClassName +
            "'\n" +
            pbBaseDataManagerContent

        let logicFilePath = dataPath + logicClassName + ".ts"
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
        _doInitConent += `${twoTable}data.${messagePbDateName}${fileName}.forEach((data) => {\n`
        _doInitConent += `${threeTable}let pbData = new ${logicClassName}(data)\n`
        _doInitConent += `${threeTable}pbData.handlePbExcelDataManager = this\n`
        _doInitConent += `${threeTable}this.${dataName}[pbData.uniqueKeyData] = pbData\n`
        _doInitConent += `${twoTable}})\n`
    })
    for (const key in alreadyCreateLogicFile) {
        if (alreadyCreateLogicFile[key]) {
            console.warn("该逻辑代码文件:" + key + " 不存在excel表格中,请确认是否需要")
        }
    }

    initFuncContent = initFuncContent.replace(`"replace you _doInitData imm"`, _doInitConent)
    pbBaseDataManagerContent += initFuncContent
    pbBaseDataManagerContent = `import { excelPb } from "./excelPb"\n` + pbBaseDataManagerContent
    // console.log(content)
    createAndWriteFileSync(excelDataModelPath, noModifyTips + content)
    createAndWriteFileSync(pbBaseDataManager, noModifyTips + pbBaseDataManagerContent)

    let pbExcelDataContent =
        canModifyTips +
        `import { ${BaseDataManagerClassName} } from '../readonly/${BaseDataManagerClassName}'
export class ExcelDataManager extends ${BaseDataManagerClassName} {}`

    createAndWriteFileSync(dataPath + ExcelDataManagerClassName + ".ts", pbExcelDataContent)
    createAndWriteFileSync(baseDataPath)
    createPbts(baseDataPath, protoDirPath, "excelPb", () => {
        console.log("生成ts文件内容完成")
        if (overCall) {
            overCall()
        }
    })
}

// excelToPbTs("F:/creatorProject/creatorPlugin/excel", "F:/creatorProject/creatorPlugin/assets")
