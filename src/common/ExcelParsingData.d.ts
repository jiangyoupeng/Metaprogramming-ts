export declare function convertExcelTypeToTsType(type: string): string;
export declare function convertExcelTypeToPbType(type: string): string;
declare class ForegignData {
    foreignTableName: string;
    foreignKeyName: string;
    constructor(foreignTableName: string, foreignKeyName: string);
}
declare class ExcelObjData {
    dataArr: Map<string, any>[];
    tipsMap: Map<string, string>;
    nameSet: Set<string>;
    typeMap: Map<string, string>;
    foreignMap: Map<string, ForegignData>;
    primaryKey: string;
    primaryKeyName: string;
    private _initSuc;
    isInitSuc(): boolean;
    constructor(tableData: any[], tableKey: string, isClient: boolean);
}
export declare class ExcelParsingData {
    excelTableMap: Map<string, ExcelObjData>;
    constructor(excelDirPath: string, isClient: boolean);
}
export {};
