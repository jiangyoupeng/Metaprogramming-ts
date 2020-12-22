"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPbts = void 0;
var CmdUtils_1 = require("./CmdUtils");
// 通过.proto文件生成pb的ts 同时将commonjs的格式转换为es6
function createPbts(pbTsDirPath, protoDirPath, pbName, overCall) {
    pbName = pbName || "pb";
    CmdUtils_1.cmd("pbjs" + (process.platform === "win32" ? ".cmd" : "") + " --keep-case --force-number --no-convert --no-delimited --no-verify -r protobuf -t static-module -w es6 -o " + pbTsDirPath + "/" + pbName + ".js " + protoDirPath + "/*.proto", "pbts" + (process.platform === "win32" ? ".cmd" : "") + " -o " + pbTsDirPath + "/" + pbName + ".d.ts " + pbTsDirPath + "/" + pbName + ".js", function () {
        console.log("从" + protoDirPath + ("\u751F\u6210" + pbName + ".js," + pbName + ".d.ts \u6210\u529F"));
        if (overCall) {
            overCall();
        }
    });
}
exports.createPbts = createPbts;
//# sourceMappingURL=CreatePBTs.js.map