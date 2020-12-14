import { spawn, ChildProcess } from "child_process"
import { formatConsole } from "./ConsoleUtils"
const _cmds: (string | Function)[] = []
let _running: boolean = false
export function cmd(...cmds: (string | Function)[]): void {
    // const process: ChildProcess = spawn()
    cmds.map((cmd: string | Function): void => {
        if (typeof cmd === "function") {
            _cmds.push(cmd)
        } else {
            _cmds.push(cmd.replace(/\s+/g, " "))
        }
    })
    if (!_running) {
        _running = true
        nextCmd(false)
    }
}

export function cmdSilence(...cmds: (string | Function)[]): void {
    cmds.map((cmd: string | Function): void => {
        if (typeof cmd === "function") {
            _cmds.push(cmd)
        } else {
            _cmds.push(cmd.replace(/\s+/g, " "))
        }
    })
    if (!_running) {
        _running = true
        nextCmd(true)
    }
}

function nextCmd(silence: boolean): void {
    const cmd: string | Function  = <string | Function>_cmds.shift()
    if (typeof cmd === "function") {
        cmd()
        nextCmd(silence)
    } else if (cmd) {
        console.log(formatConsole([cmd], "grey"))
        const args: string[] = cmd.split(" ")
        const command: string  = <string>(process.platform === "win32" ? args?.shift()?.replace("npm", "npm.cmd") : args.shift())
        const childProcess: ChildProcess = spawn(command, args, { stdio: "inherit" })
        childProcess.on("error", (err: Error): void => {
            console.log("cmd error:", JSON.stringify(err))
            nextCmd(silence)
        })
        childProcess.on("exit", (code: number, signal: string): void => {
            if (code !== 0 || signal != null) {
                console.log("exit code:", code, signal)
            }
            nextCmd(silence)
        })
    } else {
        _running = false
    }
}
