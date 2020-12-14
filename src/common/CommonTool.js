"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDir = exports.createAndWriteFileSync = void 0;
var fs = require("fs");
var path = require("path");
function createAndWriteFileSync(filePath, content) {
    var arr = filePath.split("/");
    var dir = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        dir = dir + "/" + arr[i];
    }
    if (content) {
        fs.writeFileSync(filePath, content);
    }
    else {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
    console.log("写入文件/文件夹 " + filePath + " 成功");
}
exports.createAndWriteFileSync = createAndWriteFileSync;
function removeDir(dir) {
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            var newPath = path.join(dir, files[i]);
            var stat = fs.statSync(newPath);
            if (stat.isDirectory()) {
                //如果是文件夹就递归下去
                removeDir(newPath);
            }
            else {
                //删除文件
                fs.unlinkSync(newPath);
            }
        }
        fs.rmdirSync(dir); //如果文件夹是空的，就将自己删除掉
        console.log("删除文件夹 " + dir);
    }
}
exports.removeDir = removeDir;
//# sourceMappingURL=CommonTool.js.map