import { cmd } from "./CmdUtils"
import * as fs from "fs"
import { createAndWriteFileSync } from "./CommonTool"

// 通过.proto文件生成pb的ts 同时将commonjs的格式转换为es6
export function createPbts(pbTsDirPath: string, protoDirPath: string, pbName?: string, overCall?: Function) {
    pbName = pbName || "pb"
    cmd(
        `pbjs${
            process.platform === "win32" ? ".cmd" : ""
        } --keep-case --force-number --no-convert --no-delimited --no-verify -r protobuf -t static-module -w es6 -o ${pbTsDirPath}/${pbName}.js ${protoDirPath}/*.proto`,
        `pbts${process.platform === "win32" ? ".cmd" : ""} -o ${pbTsDirPath}/${pbName}.d.ts ${pbTsDirPath}/${pbName}.js`,
        (): void => {
            // 通过将protobufjs 导入项目为插件的方式 解决es6调用commonjs的问题
            let data = fs.readFileSync(`${pbTsDirPath}/${pbName}.js`)
            let content = data.toString()
            content = content.replace(`import * as $protobuf from "protobufjs/minimal"`, "const $protobuf = protobuf")
            createAndWriteFileSync(`${pbTsDirPath}/${pbName}.js`, content)
            console.log("从" + protoDirPath + `生成${pbName}.js,${pbName}.d.ts 成功`)
            if (overCall) {
                overCall()
            }
        }
    )
}
