"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPbMessage = void 0;
// 生成网络pbMessage及引用
// 生成网络pbConfig信息
var fs = require("fs");
var rd = require("rd");
var path = require("path");
var CommonTool_1 = require("../common/CommonTool");
var CreatePBTs_1 = require("../common/CreatePBTs");
var ProtoData = /** @class */ (function () {
    function ProtoData() {
        this.content = "";
        this.isRes = true;
        this.packageName = "";
    }
    return ProtoData;
}());
// 收发协议必须以Res和Req結尾
function encodePbData(pbPaths) {
    var pbDatas = [];
    for (var i = 0; i < pbPaths.length; i++) {
        var filePath = pbPaths[i];
        if (fs.statSync(filePath).isDirectory()) {
            continue;
        }
        var data = fs.readFileSync(filePath);
        var packageName = data
            .toString()
            .match(/package [^=]+;/)[0]
            .replace("package", "")
            .replace(";", "")
            .trim();
        var allMessageData = data.toString().match(/(message )\S+(\s{0,}{)/g);
        for (var j = 0; j < allMessageData.length; j++) {
            var pbData = new ProtoData();
            var message = allMessageData[j];
            var match = message.toString().match(/\S+(Res )/g);
            if (!match) {
                match = message.toString().match(/\S+(Res{)/g);
            }
            if (match) {
                match[0] = match[0].substring(0, match[0].length - 1);
                pbData.isRes = true;
                pbData.content = match[0];
            }
            else {
                match = message.toString().match(/\S+(Req )/g);
                if (!match) {
                    match = message.toString().match(/\S+(Req{)/g);
                }
                if (match) {
                    match[0] = match[0].substring(0, match[0].length - 1);
                    pbData.isRes = false;
                    pbData.content = match[0];
                }
            }
            if (pbData.content != "") {
                pbData.packageName = packageName;
                pbDatas.push(pbData);
            }
        }
    }
    return pbDatas;
}
function createPbMessage(pbDirPath, pbCreateDirPath) {
    var protoFiles = rd.readSync(pbDirPath);
    var pbDatas = encodePbData(protoFiles);
    // 写入netMessage信息
    pbDatas.forEach(function (pbData) {
        var parser = pbData.packageName + "." + pbData.content;
        var exportStr = "import { " + pbData.content + " } from './" + pbData.packageName + "'\n";
        exportStr += "export function " + pbData.content + "Handle(res: " + parser + ") {\n    \n    }\n    ";
        var filePath = path.join(pbCreateDirPath, pbData.packageName);
        if (!fs.existsSync(filePath)) {
            CommonTool_1.createAndWriteFileSync(filePath, exportStr);
        }
    });
    CreatePBTs_1.createPbts(pbCreateDirPath, pbDirPath, "netPb", function () {
        console.log("生成netPb ts文件内容完成");
    });
}
exports.createPbMessage = createPbMessage;
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
//# sourceMappingURL=PbMessageCreate.js.map