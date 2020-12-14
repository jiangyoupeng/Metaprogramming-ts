import * as fs from "fs"
import { createAndWriteFileSync, removeDir } from "../common/CommonTool"
import { convertExcelTypeToTsType, ExcelParsingData } from "../common/ExcelParsingData"
import { JypFrameDefine } from "../common/JypFrameDefine"

let excelDataName = "excelData.json"
export function doCreateTsJsonData(excelParsingData: ExcelParsingData, projectResource: string) {
    // 只支持唯一主键
    let settingJsonData = {}
    let tableDatas = excelParsingData.excelTableMap

    tableDatas.forEach((tableData, key) => {
        let fileName = key.charAt(0).toUpperCase() + key.slice(1)
        let tableJsonData: any = {}
        settingJsonData[fileName] = tableJsonData
        let ids = []
        let keys = []
        let values = []
        let foreign = {}
        tableData.nameSet.forEach((name) => {
            keys.push(name)
        })
        tableData.foreignMap.forEach((foreignData, name) => {
            foreign[name] = { dataType: foreignData.foreignTableName, dataKey: foreignData.foreignKeyName }
        })

        for (let index = 0; index < tableData.dataArr.length; index++) {
            const oneLineData = tableData.dataArr[index]
            let valueData = []
            oneLineData.forEach((oneData, name) => {
                let type = tableData.typeMap.get(name)
                let factType = convertExcelTypeToTsType(type)
                if (oneData !== undefined && oneData !== null) {
                    if (type.indexOf("[]") !== -1) {
                        let newValue = oneData
                        newValue = newValue.split("[")[1]
                        newValue = newValue.split("]")[0]

                        let valueDataArr = newValue.split(",")
                        if (factType.indexOf("number") !== -1) {
                            for (let index = 0; index < valueDataArr.length; index++) {
                                valueDataArr[index] = parseFloat(valueDataArr[index])
                            }
                        } else if (factType.indexOf("boolean") !== -1) {
                            for (let index = 0; index < valueDataArr.length; index++) {
                                if (valueDataArr[index] === "true") {
                                    valueDataArr[index] = true
                                } else if (valueDataArr[index] === "false") {
                                    valueDataArr[index] = false
                                } else {
                                    console.error("error to convert boolean " + valueDataArr[index])
                                }
                            }
                        }
                        oneData = valueDataArr
                    } else {
                        if (type !== "string") {
                            try {
                                oneData = JSON.parse("[" + oneData + "]")[0]
                            } catch (error) {
                                console.log("错误的解析数据 " + oneData + " 表: " + fileName + " 类型 " + type + " 名字 " + name)
                            }
                        } else {
                            oneData = "" + oneData
                        }
                    }
                } else {
                    oneData = null
                }
                valueData.push(oneData)
                if (name == tableData.primaryKeyName) {
                    ids.push(oneData)
                }
            })
            values.push(valueData)
        }
        tableJsonData.ids = ids
        tableJsonData.keys = keys
        tableJsonData.values = values
        tableJsonData.foreign = foreign
    })
    let writeDirPath = projectResource + JypFrameDefine.frameCodeCreateExcelDataResName
    let writePath = writeDirPath + "/" + JypFrameDefine.frameCodeCreateExcelDataResName + ".json"
    removeDir(writeDirPath)
    createAndWriteFileSync(writePath, JSON.stringify(settingJsonData, null, 4))
    console.log("excel转换json数据完成")
}

export function createTsJsonData(excelDirPath: string, projectResource: string) {
    let excelParsingData = new ExcelParsingData(excelDirPath, true)
    doCreateTsJsonData(excelParsingData, projectResource)
}

// createTsJsonData("F:/creatorProject/creatorPlugin/excel", "F:/creatorProject/creatorPlugin/assets/resources/")
