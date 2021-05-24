/**
 * SparkMD5 OOP implementation.
 *
 * Use this class to perform an incremental md5, otherwise use the
 * static methods instead.
 */
export declare function SparkMD5(this: any): void;
export declare namespace SparkMD5 {
    var hash: (str: any, raw?: any) => any;
    var hashBinary: (content: any, raw: any) => any;
    var ArrayBuffer: () => void;
}
