"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdSilence = exports.cmd = void 0;
var child_process_1 = require("child_process");
var ConsoleUtils_1 = require("./ConsoleUtils");
var _cmds = [];
var _running = false;
function cmd() {
    var cmds = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cmds[_i] = arguments[_i];
    }
    // const process: ChildProcess = spawn()
    cmds.map(function (cmd) {
        if (typeof cmd === "function") {
            _cmds.push(cmd);
        }
        else {
            _cmds.push(cmd.replace(/\s+/g, " "));
        }
    });
    if (!_running) {
        _running = true;
        nextCmd(false);
    }
}
exports.cmd = cmd;
function cmdSilence() {
    var cmds = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cmds[_i] = arguments[_i];
    }
    cmds.map(function (cmd) {
        if (typeof cmd === "function") {
            _cmds.push(cmd);
        }
        else {
            _cmds.push(cmd.replace(/\s+/g, " "));
        }
    });
    if (!_running) {
        _running = true;
        nextCmd(true);
    }
}
exports.cmdSilence = cmdSilence;
function nextCmd(silence) {
    var _a;
    var cmd = _cmds.shift();
    if (typeof cmd === "function") {
        cmd();
        nextCmd(silence);
    }
    else if (cmd) {
        console.log(ConsoleUtils_1.formatConsole([cmd], "grey"));
        var args = cmd.split(" ");
        var command = (process.platform === "win32" ? (_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.replace("npm", "npm.cmd") : args.shift());
        var childProcess = child_process_1.spawn(command, args, { stdio: "inherit" });
        childProcess.on("error", function (err) {
            console.log("cmd error:", JSON.stringify(err));
            nextCmd(silence);
        });
        childProcess.on("exit", function (code, signal) {
            if (code !== 0 || signal != null) {
                console.log("exit code:", code, signal);
            }
            nextCmd(silence);
        });
    }
    else {
        _running = false;
    }
}
//# sourceMappingURL=CmdUtils.js.map