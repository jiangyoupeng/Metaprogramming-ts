"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerPbMessage = exports.createClientPbMessage = void 0;
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
function createClientPbMessage(pbDirPath, pbCreateDirPath, callback) {
    _doCreateNetMessage(pbDirPath, pbCreateDirPath, "Res", callback);
}
exports.createClientPbMessage = createClientPbMessage;
function createServerPbMessage(pbDirPath, pbCreateDirPath, callback) {
    _doCreateNetMessage(pbDirPath, pbCreateDirPath, "Req", callback);
}
exports.createServerPbMessage = createServerPbMessage;
function _doCreateNetMessage(pbDirPath, pbCreateDirPath, matchStr, callback) {
    var protoFiles = rd.readSync(pbDirPath);
    var pbDatas = encodePbData(protoFiles);
    var fileAllFileMap = new Set();
    if (fs.existsSync(pbCreateDirPath)) {
        fileAllFileMap = new Set(rd.readSync(pbCreateDirPath));
    }
    var netPbClassRef = "export class NetPbClassRef {\n";
    var netMsgRef = "export class NetMsgRef {\n";
    var packageName = "";
    // 写入netMessage信息
    pbDatas.forEach(function (pbData) {
        if (pbData.content.lastIndexOf(matchStr) !== -1) {
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
            netMsgRef = "import {" + pbData.content + "Handle} from './" + pbData.content + "'\n" + netMsgRef;
            netMsgRef += "    static readonly " + pbData.content + "Handle = " + pbData.content + "Handle\n";
            netPbClassRef += "    static readonly " + pbData.content + " = " + pbData.packageName + "." + pbData.content + "\n";
        }
    });
    netMsgRef += "}";
    netPbClassRef += "}";
    netPbClassRef = "import { " + packageName + " } from './" + packageName + "'\n" + netPbClassRef;
    var refPath = path.join(pbCreateDirPath, "NetMsgRef.ts");
    var pbRefPath = path.join(pbCreateDirPath, "NetPbClassRef.ts");
    fileAllFileMap.forEach(function (value) {
        if (value.lastIndexOf(".ts") !== -1 &&
            value.lastIndexOf(".meta") === -1 &&
            value.lastIndexOf(".d.ts") === -1 &&
            value.lastIndexOf(refPath) === -1 &&
            value.lastIndexOf(pbRefPath) === -1) {
            console.warn("不存在pb数据内的文件:" + value);
        }
    });
    CommonTool_1.createAndWriteFileSync(refPath, netMsgRef);
    CommonTool_1.createAndWriteFileSync(pbRefPath, netPbClassRef);
    var esTarget = "es6";
    if (matchStr == "Req") {
        esTarget = "es5";
    }
    CreatePBTs_1.createPbts(pbCreateDirPath, pbDirPath, packageName, "es6", function () {
        // 仅在客户端使用的时候需要替换
        if (matchStr == "Res") {
            // 通过将protobufjs 导入项目为插件的方式 解决es6调用commonjs的问题
            var data = fs.readFileSync(pbCreateDirPath + "/" + packageName + ".js");
            var content = data.toString();
            content = content.replace("import * as $protobuf from \"protobufjs/minimal\"", "const $protobuf = protobuf");
            CommonTool_1.createAndWriteFileSync(pbCreateDirPath + "/" + packageName + ".js", content);
        }
        console.log("\u751F\u6210" + packageName + " ts\u6587\u4EF6\u5185\u5BB9\u5B8C\u6210");
        if (callback) {
            callback();
        }
    });
}
// createClientPbMessage(
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/proto",
//     "F:/creatorProject/creatorPlugin_3_0_0_preview/assets/game/net"
// )
//# sourceMappingURL=PbMessageCreate.js.map