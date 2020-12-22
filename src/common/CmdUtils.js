import { spawn } from "child_process";
import { formatConsole } from "./ConsoleUtils";
const _cmds = [];
let _running = false;
export function cmd(...cmds) {
    // const process: ChildProcess = spawn()
    cmds.map((cmd) => {
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
export function cmdSilence(...cmds) {
    cmds.map((cmd) => {
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
function nextCmd(silence) {
    var _a;
    const cmd = _cmds.shift();
    if (typeof cmd === "function") {
        cmd();
        nextCmd(silence);
    }
    else if (cmd) {
        console.log(formatConsole([cmd], "grey"));
        const args = cmd.split(" ");
        const command = (process.platform === "win32" ? (_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.replace("npm", "npm.cmd") : args.shift());
        const childProcess = spawn(command, args, { stdio: "inherit" });
        childProcess.on("error", (err) => {
            console.log("cmd error:", JSON.stringify(err));
            nextCmd(silence);
        });
        childProcess.on("exit", (code, signal) => {
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