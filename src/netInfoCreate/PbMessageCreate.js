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
        // 去掉注释
        var dataStr = fs.readFileSync(filePath).toString();
        var commentStr = dataStr.match(/\/\/[^\n\r]+/g);
        for (var index = 0; index < commentStr.length; index++) {
            var element = commentStr[index];
            dataStr = dataStr.replace(element, "");
        }
        var packageName = dataStr
            .match(/package [\w]+;/)[0]
            .replace("package", "")
            .replace(";", "")
            .trim();
        var allMessageData = dataStr.match(/(message )\S+(\s{0,}{)/g);
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
    var fileAllFileMap = new Set();
    if (fs.existsSync(pbCreateDirPath)) {
        fileAllFileMap = new Set(rd.readSync(pbCreateDirPath));
    }
    //  = rd.readSync(pbCreateDirPath)
    var packageName;
    // 写入netMessage信息
    pbDatas.forEach(function (pbData) {
        if (pbData.content.lastIndexOf("Res") !== -1) {
            if (!packageName) {
                packageName = pbData.packageName;
            }
            else if (packageName !== pbData.packageName) {
                console.error("packageName must same. packageName1:" + packageName + " packageName2:" + pbData.packageName);
            }
            var exportStr = "import { " + pbData.packageName + " } from './" + pbData.packageName + "'\n";
            exportStr += "export function " + pbData.content + "Handle(res: " + pbData.packageName + "." + pbData.content + ") {}\n";
            var filePath = path.join(pbCreateDirPath, pbData.content + ".ts");
            if (!fs.existsSync(filePath)) {
                CommonTool_1.createAndWriteFileSync(filePath, exportStr);
            }
            if (fileAllFileMap.has(filePath)) {
                fileAllFileMap.delete(filePath);
            }
        }
    });
    fileAllFileMap.forEach(function (value) {
        if (value.lastIndexOf(".ts") !== -1 && value.lastIndexOf(".meta") === -1 && value.lastIndexOf(".d.ts") === -1) {
            console.warn("不存在pb数据内的文件:" + value);
        }
    });
    CreatePBTs_1.createPbts(pbCreateDirPath, pbDirPath, packageName, function () {
        console.log("\u751F\u6210" + packageName + " ts\u6587\u4EF6\u5185\u5BB9\u5B8C\u6210");
    });
}
exports.createPbMessage = createPbMessage;
// createPbMessage("F:/creatorProject/creatorPlugin/proto", "F:/creatorProject/creatorPlugin/assets/game/net")
//# sourceMappingURL=PbMessageCreate.js.map