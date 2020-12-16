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
            .match(/package [^=]+;/)[0]
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
    // 写入netMessage信息
    pbDatas.forEach((pbData) => {
        let parser = pbData.packageName + `.` + pbData.content
        let exportStr = `import { ${pbData.content} } from './${pbData.packageName}'\n`
        exportStr += `export function ${pbData.content}Handle(res: ${parser}) {
    
    }
    `
        let filePath = path.join(pbCreateDirPath, pbData.packageName)
        if (!fs.existsSync(filePath)) {
            createAndWriteFileSync(filePath, exportStr)
        }
    })

    createPbts(pbCreateDirPath, pbDirPath, "netPb", () => {
        console.log("生成netPb ts文件内容完成")
    })
}
// 创建网络消息res,req的define
// export function PbConfigCreate(pbDirPath: string, configTsPath: string) {
//     if (fs.existsSync(pbDirPath)) {
//         let allProtoFile = rd.readSync(pbDirPath)
//         if (allProtoFile.length > 0) {
//             console.log(allProtoFile)
//             let pbDatas = encodePbData(allProtoFile)
//             let content = getPbConfigContent(pbDatas)
//             console.log(content)
//             createAndWriteFileSync(configTsPath, content)
//         } else {
//             console.warn("当前路径: " + pbDirPath + " 找不到pb文件,请将pb存放到项目指定位置")
//         }
//     } else {
//         console.warn("当前路径: " + pbDirPath + " 不存在文件夹,请将pb存放到项目指定位置")
//     }
// }
