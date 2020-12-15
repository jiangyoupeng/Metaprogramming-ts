import * as fs from "fs"
import * as xlsx from "xlsx"

// int 默认为int32,如果要声明为int64需要特殊写明
const supportTypeDefine: Set<string> = new Set(["int", "int64", "float", "double", "bool", "string"])
const excelTypeToTsTypeDefine: Map<string, string> = new Map([
    ["int", "number"],
    ["int64", "number"],
    ["float", "number"],
    ["double", "number"],
    ["bool", "boolean"],
    ["string", "string"],
])
const excelTypeToPbTypeDefine: Map<string, string> = new Map([
    ["int", "int32"],
    ["int64", "int64"],
    ["float", "float"],
    ["double", "double"],
    ["bool", "bool"],
    ["string", "string"],
])
const excelKeyBeginDefine = "__EMPTY"
const primaryKeyDefine = "PRIMARY"
const foreignKeyDefine = "FOREIGN:"
export function convertExcelTypeToTsType(type: string) {
    let tsType: string
    if (supportTypeDefine.has(type)) {
        tsType = excelTypeToTsTypeDefine.get(type)
    } else {
        let factType = type
        let arrIndex = type.indexOf("[]")
        if (arrIndex != -1) {
            factType = type.substring(0, arrIndex)
        }
        if (supportTypeDefine.has(factType)) {
            tsType = excelTypeToTsTypeDefine.get(factType) + "[]"
        } else {
            console.error("错误的类型转换 " + type)
        }
    }
    return tsType
}
export function convertExcelTypeToPbType(type: string) {
    let tsType: string
    if (supportTypeDefine.has(type)) {
        tsType = excelTypeToPbTypeDefine.get(type)
    } else {
        let factType = type
        let arrIndex = type.indexOf("[]")
        if (arrIndex != -1) {
            factType = type.substring(0, arrIndex)
        }
        if (supportTypeDefine.has(factType)) {
            tsType = excelTypeToPbTypeDefine.get(factType) + "[]"
        } else {
            console.error("错误的类型转换 " + type)
        }
    }
    return tsType
}

class ForegignData {
    foreignTableName: string
    foreignKeyName: string

    constructor(foreignTableName: string, foreignKeyName: string) {
        this.foreignTableName = foreignTableName
        this.foreignKeyName = foreignKeyName
    }
}

class ExcelObjData {
    // key都为name那一列
    dataArr: Map<string, any>[] = []
    tipsMap: Map<string, string> = new Map()
    nameSet: Set<string> = new Set()
    typeMap: Map<string, string> = new Map()
    foreignMap: Map<string, ForegignData> = new Map()
    primaryKey: string
    primaryKeyName: string
    private _initSuc: boolean = false
    isInitSuc() {
        return this._initSuc
    }

    constructor(tableData: any[], tableKey: string, isClient: boolean) {
        let tipsData = tableData[0]
        let cOrsLogoData = tableData[1]
        let typeData = tableData[2]
        let nameData = tableData[3]
        let refrenceData = tableData[4]

        if (typeData === undefined || nameData === undefined) {
            console.error("错误的excel表 " + tableKey + " 类型数据和命名数据不能为空")
            return
        }
        // 长度为type或者name的长度 如果两者不一致 说明数据表有问题
        let index = 0
        let searchKeyMap: Map<string, string> = new Map()
        while (true) {
            let searchKey = excelKeyBeginDefine
            if (index > 0) {
                searchKey = searchKey + "_" + index
            }
            index++
            let name = nameData[searchKey]
            let type = typeData[searchKey]

            // 正常退出
            if (type === undefined && name == undefined) {
                break
            }
            if (type === undefined || name == undefined) {
                console.error("错误的excel表 " + tableKey + " 类型和名字不能为空")
                return
            }
            if (this.nameSet.has(name)) {
                console.error("错误的excel表 " + tableKey + " 不可定义重复的name " + name)
                return
            }

            if (!supportTypeDefine.has(type)) {
                let factType = type
                let arrIndex = type.indexOf("[]")
                if (arrIndex != -1) {
                    factType = type.substring(0, arrIndex)
                }
                if (!supportTypeDefine.has(factType)) {
                    console.error("错误的excel表 " + tableKey + " 不支持的类型 " + type)
                    return
                }
            }

            let cOrsLogo = cOrsLogoData[searchKey]
            if (!cOrsLogo) {
                console.warn("excel表 " + tableKey + " 没有声明c/s " + name)
                continue
            }
            // 非当前系统需要的队列不需要用
            if (
                (isClient && cOrsLogo.indexOf("c") == -1 && cOrsLogo.indexOf("C") == -1) ||
                (!isClient && cOrsLogo.indexOf("s") == -1 && cOrsLogo.indexOf("S") == -1)
            ) {
                continue
            }

            this.nameSet.add(name)
            let tips = tipsData[searchKey]

            if (tips) {
                this.tipsMap.set(name, tips)
            }
            this.typeMap.set(name, type)

            let ref = refrenceData[searchKey]
            if (ref) {
                if (ref === primaryKeyDefine) {
                    this.primaryKey = searchKey
                    this.primaryKeyName = name
                } else if (ref.indexOf(foreignKeyDefine) === 0) {
                    let refData = ref.substring(foreignKeyDefine.length)
                    let params = refData.split(".")
                    this.foreignMap.set(name, new ForegignData(params[0], params[1]))
                } else {
                    console.error("错误的ref建定义 " + ref)
                    return
                }
            }
            searchKeyMap.set(name, searchKey)
        }

        // 数据表从5开始
        for (let itemIndex = 5; itemIndex < tableData.length; itemIndex++) {
            const itemData = tableData[itemIndex]

            let valueData: Map<string, any> = new Map()
            this.nameSet.forEach((name: string) => {
                let searchKey = searchKeyMap.get(name)
                let value = itemData[searchKey]
                valueData.set(name, value)
            })
            this.dataArr.push(valueData)
        }

        this._initSuc = true
    }
}

export class ExcelParsingData {
    excelTableMap: Map<string, ExcelObjData> = new Map()
    constructor(excelDirPath: string, isClient: boolean) {
        console.log("开始解析excel目录 " + excelDirPath)
        let createFiles = fs.readdirSync(excelDirPath)
        let tableDatas = {}
        for (let i = 0; i < createFiles.length; i++) {
            let file = createFiles[i]
            if (file.indexOf(".xlsx") !== -1) {
                let baseName = file.substring(0, file.indexOf("."))
                let workbook = xlsx.readFile(excelDirPath + "/" + file) //workbook就是xls文档对象
                let sheetNames = workbook.SheetNames //获取表名
                let sheet = workbook.Sheets[sheetNames[0]] //通过表名得到表对象
                tableDatas[baseName] = xlsx.utils.sheet_to_json(sheet) //通过工具将表对象的数据读出来并转成json
            }
        }

        for (const key in tableDatas) {
            const tableData = tableDatas[key]

            let excelObjData = new ExcelObjData(tableData, key, isClient)
            this.excelTableMap.set(key, excelObjData)
        }
    }
}
