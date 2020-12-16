// 生成网络pbMessage及引用
// 生成网络pbConfig信息
import * as fs from "fs"
import * as rd from "rd"
import * as path from "path"
import { createAndWriteFileSync } from "../common/CommonTool"
import { createPbts } from "../common/CreatePBTs"

class ProtoData {
    content: string = ""
    isRes: boolean = true
    packageName: string = ""
}

// 收发协议必须以Res和Req結尾
function encodePbData(pbPaths: string[]): ProtoData[] {
    let pbDatas: ProtoData[] = []
    for (let i = 0; i < pbPaths.length; i++) {
        let filePath = pbPaths[i]
        if (fs.statSync(filePath).isDirectory()) {
            continue
        }
        let data = fs.readFileSync(filePath)

        const packageName: string = data
            .toString()
            .match(/package [\w]+;/)[0]
            .replace("package", "")
            .replace(";", "")
            .trim()
        let allMessageData = data.toString().match(/(message )\S+(\s{0,}{)/g)

        for (let j = 0; j < allMessageData.length; j++) {
            let pbData = new ProtoData()
            let message = allMessageData[j]
            let match = message.toString().match(/\S+(Res )/g)
            if (!match) {
                match = message.toString().match(/\S+(Res{)/g)
            }
            if (match) {
                match[0] = match[0].substring(0, match[0].length - 1)
                pbData.isRes = true
                pbData.content = match[0]
            } else {
                match = message.toString().match(/\S+(Req )/g)
                if (!match) {
                    match = message.toString().match(/\S+(Req{)/g)
                }
                if (match) {
                    match[0] = match[0].substring(0, match[0].length - 1)
                    pbData.isRes = false
                    pbData.content = match[0]
                }
            }
            if (pbData.content != "") {
                pbData.packageName = packageName
                pbDatas.push(pbData)
            }
        }
    }
    return pbDatas
}

export function createPbMessage(pbDirPath: string, pbCreateDirPath: string) {
    let protoFiles = rd.readSync(pbDirPath)

    let pbDatas = encodePbData(protoFiles)

    let fileAllFileMap: Set<string> = new Set()
    if (fs.existsSync(pbCreateDirPath)) {
        fileAllFileMap = new Set(rd.readSync(pbCreateDirPath))
    }
    //  = rd.readSync(pbCreateDirPath)

    let packageName
    // 写入netMessage信息
    pbDatas.forEach((pbData) => {
        if (pbData.content.lastIndexOf("Res") !== -1) {
            if (!packageName) {
                packageName = pbData.packageName
            } else if (packageName !== pbData.packageName) {
                console.error("packageName must same packageName1:" + packageName + " packageName2:" + pbData.packageName)
            }
            let exportStr = `import { ${pbData.packageName} } from './${pbData.packageName}'\n`
            exportStr += `export function ${pbData.content}Handle(res: ${pbData.packageName}.${pbData.content}) {}\n`
            let filePath = path.join(pbCreateDirPath, pbData.content + ".ts")
            if (!fs.existsSync(filePath)) {
                createAndWriteFileSync(filePath, exportStr)
            }
            if (fileAllFileMap.has(filePath)) {
                fileAllFileMap.delete(filePath)
            }
        }
    })

    fileAllFileMap.forEach((value) => {
        if (value.lastIndexOf(".ts") !== -1 && value.lastIndexOf(".meta") === -1 && value.lastIndexOf(".d.ts") === -1) {
            console.warn("不存在pb数据内的文件:" + value)
        }
    })

    createPbts(pbCreateDirPath, pbDirPath, packageName, () => {
        console.log(`生成${packageName} ts文件内容完成`)
    })
}
// createPbMessage("F:/creatorProject/creatorPlugin/proto", "F:/creatorProject/creatorPlugin/assets/game/net")
