import { cmd } from "./CmdUtils"

export function createPbts(pbTsDirPath: string, protoDirPath: string, pbName?: string, esTarget?: string, overCall?: Function) {
    esTarget = esTarget || "es6"
    pbName = pbName || "pb"
    cmd(
        `pbjs${
            process.platform === "win32" ? ".cmd" : ""
        } --keep-case --force-number --no-convert --no-delimited --no-verify -r protobuf -t static-module -w --${esTarget} -o ${pbTsDirPath}/${pbName}.js ${protoDirPath}/*.proto`,
        `pbts${process.platform === "win32" ? ".cmd" : ""} -o ${pbTsDirPath}/${pbName}.d.ts ${pbTsDirPath}/${pbName}.js`,
        (): void => {
            console.log("从" + protoDirPath + `生成${pbName}.js,${pbName}.d.ts 成功`)
            if (overCall) {
                overCall()
            }
        }
    )
}
