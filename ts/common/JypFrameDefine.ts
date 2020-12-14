export class JypFrameDefine {
    static readonly frameScriptBaseDirName = "jypFrame"
    static readonly frameOverWriteName = "overwrite"
    static readonly frameReadonlyName = "readonly"
    static readonly frameCodeCreateExcelDataResName = "excelData"

    static readonly noModifyTips = "//该文件为代码生成替换,请勿修改(每次执行命令会被替换)\n"
    static readonly canModifyTips = "//可以在此文件基础上修改(仅在该文件不存在时,执行命令会被生成)\n"

    static readonly messagePbTableNameBegin = "PbReadonly"
    static readonly messagePbDateNameBegin = "pbReadonly"
}
