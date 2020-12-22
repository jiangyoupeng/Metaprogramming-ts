// 生成网络pbConfig信息
import * as fs from "fs";
import * as rd from "rd";
import { createAndWriteFileSync } from "../common/CommonTool";
var ProtoData = /** @class */ (function () {
    function ProtoData() {
        this.content = "";
        this.isRes = true;
        this.packageName = "";
    }
    return ProtoData;
}());
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
function getPbConfigContent(pbDatas) {
    var tab1 = " ".repeat(4);
    var tab2 = " ".repeat(8);
    var content = "export abstract class PBConfig {\n";
    var packageNameSet = new Set();
    pbDatas.forEach(function (pbData) {
        packageNameSet.add(pbData.packageName);
        content +=
            tab1 +
                "static readonly " +
                pbData.packageName +
                pbData.content +
                ": string = '" +
                pbData.packageName +
                "." +
                pbData.content +
                "'\n";
    });
    content += tab1 + "static readonly Mapping = {\n";
    pbDatas.forEach(function (pbData) {
        var parser = pbData.packageName + "." + pbData.content;
        content += tab2 + "'" + parser + "':{ parser: " + parser + "},\n";
    });
    content += tab1 + "}\n";
    content += "}\n";
    packageNameSet.forEach(function (value) {
        content = "import { " + value + " } from './pb'\n" + content;
    });
    return content;
}
// 创建网络消息res,req的define
export function PbConfigCreate(pbDirPath, configTsPath) {
    if (fs.existsSync(pbDirPath)) {
        var allProtoFile = rd.readSync(pbDirPath);
        if (allProtoFile.length > 0) {
            console.log(allProtoFile);
            var pbDatas = encodePbData(allProtoFile);
            var content = getPbConfigContent(pbDatas);
            console.log(content);
            createAndWriteFileSync(configTsPath, content);
        }
        else {
            console.warn("当前路径: " + pbDirPath + " 找不到pb文件,请将pb存放到项目指定位置");
        }
    }
    else {
        console.warn("当前路径: " + pbDirPath + " 不存在文件夹,请将pb存放到项目指定位置");
    }
}
//# sourceMappingURL=PbConfigCreate.js.map