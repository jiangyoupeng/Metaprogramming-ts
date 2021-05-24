"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLSLInterpreter = void 0;
var SparkMD5 = require("spark-md5/Spark-md5");
var deparserToTs_1 = require("./glslCompiler/deparserToTs");
var tokenString = require("glsl-tokenizer/string");
var parseArray = require("glsl-parser/parser");
var shaderBeginContent = "import { AttributeData, FragShaderHandle, UniformData, VaringData, VertShaderHandle, StructData } from \"../ShaderDefine\"\nimport { IntData, FloatData, Vec2Data, Vec3Data, Vec4Data, Mat3Data, Mat4Data, BoolData } from \"./builtin/BuiltinData\"\n";
var BlockType;
(function (BlockType) {
    BlockType[BlockType["structBlock"] = 0] = "structBlock";
    BlockType[BlockType["funcBlock"] = 1] = "funcBlock";
    BlockType[BlockType["ifBlock"] = 2] = "ifBlock";
    BlockType[BlockType["whileBlock"] = 3] = "whileBlock";
    BlockType[BlockType["defineIfBlock"] = 4] = "defineIfBlock";
    BlockType[BlockType["defineElseBlock"] = 5] = "defineElseBlock";
    BlockType[BlockType["defineElifBlock"] = 6] = "defineElifBlock";
})(BlockType || (BlockType = {}));
var JudgeType;
(function (JudgeType) {
    JudgeType[JudgeType["more"] = 0] = "more";
    JudgeType[JudgeType["moreEqual"] = 1] = "moreEqual";
    JudgeType[JudgeType["less"] = 2] = "less";
    JudgeType[JudgeType["lessEqual"] = 3] = "lessEqual";
    JudgeType[JudgeType["equal"] = 4] = "equal";
    JudgeType[JudgeType["noEqual"] = 5] = "noEqual";
})(JudgeType || (JudgeType = {}));
var DefineBlockJudgeData = /** @class */ (function () {
    function DefineBlockJudgeData() {
        this.nowLevel = 0;
        this.canCompile = false;
        this.blockType = null;
        this.content = "";
    }
    return DefineBlockJudgeData;
}());
function getDefineOrConstNum(str, define) {
    var index = str.indexOf("!");
    var logicNeg = false;
    if (index !== -1) {
        logicNeg = true;
        str = str.substring(index + 1);
    }
    str = str.replace(/\s*/g, "");
    var num = parseFloat(str);
    if (isNaN(num)) {
        num = define.get(str);
    }
    // 在define中找不到其實也正常
    if (num === undefined) {
        console.log("在define中查找不到对应变量 " + str);
        num = 0;
    }
    if (logicNeg) {
        num = num !== 0 ? 0 : 1;
    }
    return num;
}
function compilerJudge(left, right, type, define) {
    var leftNum = getDefineOrConstNum(left, define);
    var rightNum = getDefineOrConstNum(right, define);
    var canCompiler = false;
    switch (type) {
        case JudgeType.more:
            canCompiler = leftNum > rightNum;
            break;
        case JudgeType.moreEqual:
            canCompiler = leftNum >= rightNum;
            break;
        case JudgeType.less:
            canCompiler = leftNum < rightNum;
            break;
        case JudgeType.lessEqual:
            canCompiler = leftNum <= rightNum;
            break;
        case JudgeType.equal:
            canCompiler = leftNum == rightNum;
            break;
        case JudgeType.noEqual:
            canCompiler = leftNum != rightNum;
            break;
        default:
            console.error("无法识别的类型");
            debugger;
    }
    return canCompiler;
}
var judgeOperatorStrs = [">", ">=", "<", "<=", "==", "!="];
function interpreterDefine(lineStr, defines, defineCode) {
    var judgeLine = [];
    var judgeStr = lineStr.substring(lineStr.indexOf(defineCode) + defineCode.length);
    var isAndArr = [];
    while (true) {
        var andIndex = judgeStr.indexOf("&&");
        var orIndex = judgeStr.indexOf("||");
        var spIndex = void 0;
        if (andIndex * orIndex >= 0) {
            spIndex = Math.min(andIndex, orIndex);
        }
        else {
            spIndex = Math.max(andIndex, orIndex);
        }
        if (spIndex !== -1) {
            isAndArr.push(spIndex == andIndex);
            judgeLine.push(judgeStr.substring(0, spIndex));
            judgeStr = judgeStr.substring(spIndex + defineCode.length);
        }
        else {
            judgeLine.push(judgeStr);
            break;
        }
    }
    var canCompiler = true;
    for (var index = 0; index < judgeLine.length; index++) {
        var isAnd = isAndArr[index];
        if (isAnd === undefined) {
            isAnd = true;
        }
        var str = judgeLine[index];
        var isJudgeSuc = false;
        var judgeType = null;
        var judgeIndex = -1;
        for (var index_1 = 0; index_1 < judgeOperatorStrs.length; index_1++) {
            var element = judgeOperatorStrs[index_1];
            judgeIndex = str.indexOf(element);
            if (judgeIndex !== -1) {
                judgeType = index_1;
                break;
            }
        }
        if (judgeIndex !== -1) {
            var operatorStr = judgeOperatorStrs[judgeType];
            var leftStr = str.substring(0, judgeIndex);
            var rightStr = str.substring(judgeIndex + operatorStr.length);
            // 去掉空格
            leftStr = leftStr.replace(/\s*/g, "");
            rightStr = rightStr.replace(/\s*/g, "");
            isJudgeSuc = compilerJudge(leftStr, rightStr, judgeType, defines);
        }
        else {
            var num = getDefineOrConstNum(str, defines);
            isJudgeSuc = num != 0;
        }
        if (isJudgeSuc) {
            if (isAnd) {
                // 继续
            }
            else {
                canCompiler = true;
                break;
            }
        }
        else {
            if (isAnd) {
                canCompiler = false;
                break;
            }
            else {
                // 继续
            }
        }
    }
    return canCompiler;
}
var GLSLInterpreter = /** @class */ (function () {
    function GLSLInterpreter() {
    }
    GLSLInterpreter.interpreter = function (source) {
        var lines = source.split("\n");
        var defines = new Map();
        var strDefines = new Map();
        // 根据块层级定义的defines语句判断
        var nowLevelBlock = 0;
        var levelBlockDefinesJudge = new Map();
        var attributeKey = "attribute ";
        var varyingKey = "varying ";
        var uniformKey = "uniform ";
        var structKey = "struct ";
        var isVert = source.indexOf("gl_Position") !== -1;
        // 不能提前计算define
        // 通过#if 语句排除不执行的语句
        var excludeUnuseLine = [];
        var remainContent = "";
        var bloackStack = [];
        var _loop_1 = function (i) {
            var lineStr = lines[i];
            var strArr = lineStr.split(" ");
            var analysisStr = [];
            strArr.forEach(function (element) {
                if (element !== "") {
                    analysisStr.push(element);
                }
            });
            // 所以的语句都会被判断
            // 所以要一直往父节点判断 都是可以编译的 才能编译
            var canHandleLine = false;
            if (levelBlockDefinesJudge.size > 0) {
                for (var index = nowLevelBlock; index > 0; index--) {
                    var levelBlockData = levelBlockDefinesJudge.get(index);
                    var nowBlockData = levelBlockData[levelBlockData.length - 1];
                    canHandleLine = nowBlockData.canCompile;
                    if (!canHandleLine) {
                        break;
                    }
                }
            }
            else {
                canHandleLine = true;
            }
            if (lineStr.indexOf("#") !== -1) {
                if (lineStr.indexOf("define") !== -1) {
                    if (!canHandleLine) {
                        return "continue";
                    }
                    var index = lineStr.indexOf("define");
                    if (lineStr.indexOf("(") !== -1) {
                        console.error("暂时无法识别define中的(");
                        debugger;
                    }
                    var remainStr = lineStr.substr(index + "define".length);
                    var strArr_1 = remainStr.split(" ");
                    var keyValueStr_1 = [];
                    strArr_1.forEach(function (element) {
                        if (element !== "") {
                            keyValueStr_1.push(element);
                        }
                    });
                    var value = parseFloat(keyValueStr_1[1]);
                    if (isNaN(value)) {
                        value = keyValueStr_1[1];
                        strDefines.set(keyValueStr_1[0], value);
                    }
                    else {
                        defines.set(keyValueStr_1[0], value);
                    }
                }
                else if (lineStr.indexOf("#ifdef") !== -1 || lineStr.indexOf("# ifdef") !== -1) {
                    nowLevelBlock++;
                    var nowLevelBlockData = new DefineBlockJudgeData();
                    nowLevelBlockData.nowLevel = nowLevelBlock;
                    nowLevelBlockData.blockType = BlockType.defineIfBlock;
                    nowLevelBlockData.content = lineStr;
                    if (levelBlockDefinesJudge.get(nowLevelBlock)) {
                        console.error("不应该在if语句中有同一层级的数据");
                        debugger;
                    }
                    // if下的语句可以编译
                    if (defines.get(analysisStr[1])) {
                        nowLevelBlockData.canCompile = true;
                        // bloackStack.push({ type: BlockType.defineIfBlock, value: true, canBuild: true })
                    }
                    else {
                        nowLevelBlockData.canCompile = false;
                        // 不可编译
                        // bloackStack.push({ type: BlockType.defineIfBlock, value: false, canBuild: false })
                    }
                    levelBlockDefinesJudge.set(nowLevelBlock, [nowLevelBlockData]);
                }
                else if (lineStr.indexOf("#if") !== -1 || lineStr.indexOf("# if") !== -1) {
                    nowLevelBlock++;
                    var nowLevelBlockData = new DefineBlockJudgeData();
                    nowLevelBlockData.nowLevel = nowLevelBlock;
                    nowLevelBlockData.blockType = BlockType.defineIfBlock;
                    nowLevelBlockData.content = lineStr;
                    if (levelBlockDefinesJudge.get(nowLevelBlock)) {
                        console.error("不应该在if语句中有同一层级的数据");
                        debugger;
                    }
                    // 要进行语句判断
                    var canCompiler = interpreterDefine(lineStr, defines, "if");
                    nowLevelBlockData.canCompile = canCompiler;
                    levelBlockDefinesJudge.set(nowLevelBlock, [nowLevelBlockData]);
                    // if (canCompiler) {
                    //     bloackStack.push({ type: BlockType.defineIfBlock, value: true, canBuild: true, nowLevel: 0, buildLevel: 0 })
                    // } else {
                    //     // 不可编译
                    //     bloackStack.push({ type: BlockType.defineIfBlock, value: false, canBuild: false })
                    // }
                }
                else if (lineStr.indexOf("#elif") !== -1 || lineStr.indexOf("# elif") !== -1) {
                    var levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock);
                    if (!levelBlockData) {
                        console.error("elif语句中必然有同一层级的数据");
                        debugger;
                    }
                    // 如果之前有成功编译的条件语句的话 后面的预编译判断都不能生效
                    var hasCompiler = false;
                    for (var index = 0; index < levelBlockData.length; index++) {
                        var element = levelBlockData[index];
                        if (element.canCompile) {
                            hasCompiler = true;
                            break;
                        }
                    }
                    var nowLevelBlockData = new DefineBlockJudgeData();
                    nowLevelBlockData.nowLevel = nowLevelBlock;
                    nowLevelBlockData.blockType = BlockType.defineElifBlock;
                    nowLevelBlockData.content = lineStr;
                    if (hasCompiler) {
                        nowLevelBlockData.canCompile = false;
                    }
                    else {
                        var canCompiler = interpreterDefine(lineStr, defines, "elif");
                        nowLevelBlockData.canCompile = canCompiler;
                    }
                    levelBlockData.push(nowLevelBlockData);
                }
                else if (lineStr.indexOf("#else") !== -1 || lineStr.indexOf("# else") !== -1) {
                    var levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock);
                    if (!levelBlockData) {
                        console.error("elif语句中必然有同一层级的数据");
                        debugger;
                    }
                    // 如果之前有成功编译的条件语句的话 后面的预编译判断都不能生效
                    var hasCompiler = false;
                    for (var index = 0; index < levelBlockData.length; index++) {
                        var element = levelBlockData[index];
                        if (element.canCompile) {
                            hasCompiler = true;
                            break;
                        }
                    }
                    var nowLevelBlockData = new DefineBlockJudgeData();
                    nowLevelBlockData.nowLevel = nowLevelBlock;
                    nowLevelBlockData.blockType = BlockType.defineElifBlock;
                    nowLevelBlockData.content = lineStr;
                    if (hasCompiler) {
                        nowLevelBlockData.canCompile = false;
                    }
                    else {
                        // 如果是之前都没编译 证明之前的都是false 所以这个else应该生效
                        nowLevelBlockData.canCompile = true;
                    }
                    levelBlockData.push(nowLevelBlockData);
                }
                else if (lineStr.indexOf("#endif") !== -1 || lineStr.indexOf("# endif") !== -1) {
                    var levelBlockData = levelBlockDefinesJudge.get(nowLevelBlock);
                    if (!levelBlockData) {
                        console.error("endif语句中必然有同一层级的数据");
                        debugger;
                    }
                    levelBlockDefinesJudge.delete(nowLevelBlock);
                    nowLevelBlock--;
                }
                else {
                    console.error("未识别的宏定义: " + lineStr);
                }
            }
            else {
                if (canHandleLine) {
                    var pushStr_1 = lineStr;
                    strDefines.forEach(function (str, replaceStr) {
                        pushStr_1 = pushStr_1.replace(new RegExp(replaceStr, "g"), str);
                    });
                    excludeUnuseLine.push(pushStr_1);
                }
            }
        };
        for (var i = 0; i < lines.length; i++) {
            _loop_1(i);
        }
        for (var i = 0; i < excludeUnuseLine.length; i++) {
            var lineStr = excludeUnuseLine[i];
            remainContent += lineStr + "\n";
        }
        console.log(remainContent);
        var token = tokenString(remainContent);
        var ast = parseArray(token);
        // defines.forEach((value: string | number, key: string) => {
        //     remainContent = `#define ${key} ${value}\n` + remainContent
        // })
        // let token = tokenizeString(remainContent)
        // let ast = parseArray(token)
        var uniformData = new Map();
        var varyingData = new Map();
        var attributeData = new Map();
        var structDataMap = new Map();
        var structData = null;
        var logicLines = [];
        var _loop_2 = function (i) {
            var lineStr = excludeUnuseLine[i];
            // 删掉冒号
            var deleteIndex = lineStr.indexOf(";");
            if (deleteIndex !== -1) {
                lineStr = lineStr.substr(0, deleteIndex);
            }
            var strArr = lineStr.split(" ");
            var analysisStr = [];
            strArr.forEach(function (element) {
                if (element !== "") {
                    analysisStr.push(element);
                }
            });
            var index = lineStr.indexOf(varyingKey);
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    varyingData.set(analysisStr[3], analysisStr[2]);
                }
                else {
                    varyingData.set(analysisStr[2], analysisStr[1]);
                }
                return "continue";
            }
            index = lineStr.indexOf(attributeKey);
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    attributeData.set(analysisStr[3], analysisStr[2]);
                }
                else {
                    attributeData.set(analysisStr[2], analysisStr[1]);
                }
                return "continue";
            }
            index = lineStr.indexOf(uniformKey);
            if (index !== -1) {
                if (analysisStr.length == 4) {
                    uniformData.set(analysisStr[3], analysisStr[2]);
                }
                else {
                    uniformData.set(analysisStr[2], analysisStr[1]);
                }
                return "continue";
            }
            index = lineStr.indexOf(structKey);
            if (index !== -1) {
                structData = new Map();
                structDataMap.set(analysisStr[1], structData);
                return "continue";
            }
            if (structData) {
                analysisStr.forEach(function (str) {
                    if (str.indexOf("}") !== -1) {
                        structData = null;
                    }
                });
                if (analysisStr.length == 2) {
                    structData.set(analysisStr[1], analysisStr[0]);
                }
                else if (analysisStr.length == 3) {
                    structData.set(analysisStr[2], analysisStr[1]);
                }
            }
            else {
                logicLines.push(lineStr);
            }
        };
        // 获取所有的函数外部变量
        for (var i = 0; i < excludeUnuseLine.length; i++) {
            _loop_2(i);
        }
        var hash = SparkMD5.hash(source);
        // 这里的ts脚本是不包含uniform等变量声明的
        var tsScript = deparserToTs_1.deparseToTs(ast, true, "    ", uniformData, varyingData, attributeData, structDataMap, defines, isVert, hash);
        tsScript = shaderBeginContent + tsScript;
        var originSource = "/*\norigin glsl source: \n";
        originSource += source + "\n*/\n";
        console.log(originSource + tsScript);
    };
    return GLSLInterpreter;
}());
exports.GLSLInterpreter = GLSLInterpreter;
// GLSLInterpreter.interpreter(`#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
// #define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
// #define CC_RECEIVE_SHADOW 0
// #define CC_USE_IBL 0
// #define USE_LIGHTMAP 0
// #define USE_BATCHING 0
// #define CC_FORWARD_ADD 0
// #define CC_USE_HDR 0
// #define CC_PIPELINE_TYPE 0
// #define CC_USE_FOG 0
// precision highp float;
// struct StandardVertInput {
// float asd;
// highp vec4 position;
// vec3 normal;
// vec4 tangent;
// };
// attribute vec3 a_position;
// attribute vec3 a_normal;
// attribute vec2 a_texCoord;
// attribute vec4 a_tangent;
// uniform highp vec4 cc_cameraPos;
// varying vec2 v_uv;
// void main () {
// vec4 color;
// float lumaB;
// color.x = color.y = color.z = lumaB;
// float lumaMin;
// float lumaMax;
// // if ((lumaB < lumaMin) || (lumaB > lumaMax)){
// //     color = vec4(2);
// // }else{
// //     color = vec4(2);
// // }
// if ((lumaB < lumaMin) || (lumaB > lumaMax))
//     color = vec4(2);
// else if (lumaB < lumaMin)
//     color = vec4(2);
// else if (lumaB > lumaMax)
//     color = vec4(2);
// else
//     color = vec4(2);
// bool tqweqwe = false;
// if (tqweqwe){}
// float a;
// if (a > 0.9){
// }else if(a > 0.8){
// }else if(a > 0.7){
// }else{
// }
// tqweqwe = a > 0.;
// for (int i = 1; (i < 3); i++) {
//     int tes = 3;
// }
// mat3 matrix3 = mat3(1.,1.,1.,1.,1.,1.,0.1,0.2,0.3);
// mat4 matrix4 = mat4(matrix3);
// matrix4[0][0] = 0.;
// vec4 matrix4Test = matrix4[0];
// // matrix4Test.x = 0.;
// // matrix4Test.y = 0.;
// // matrix4Test.z = 0.;
// // matrix4Test.w = 1.;
// matrix4[0] = matrix4Test;
// matrix4[0][1] = 0.;
// matrix4[0][2] = 0.;
// vec3 I = vec3(1,0,0);
// I[2] = 3.;
// I[2] *= 3.;
// I.x *= 3;
// a++;
// a--;
// ++a;
// --a;
// float gg =3., bb, tt = 1;
// float b;
// float c;
// float wwww, www = a, zzz = b = c = 1. + gg + I.x;
// float fDeltaD, fDeltaY, fDensityIntegral, fDensity;
// fDensity = (sqrt(1.0 + ((fDeltaD / fDeltaY) * (fDeltaD / fDeltaY)))) * fDensityIntegral;
// I = -I;
// StandardVertInput s;
// v_uv.x = 2. * vec2(s.tangent.xy + 1.).x;
// I += 3.;
// I += I.zyx;
// I -= I.zyx;
// I -= 3.;
// I *= 1.;
// I /= 1.;
// a = a + b * c;
// a = (a + b) * c;
// vec3 N = vec3(0.5,0.5,0.5);
// // vec2 yx = vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N)));
// // v_uv.x = 2. + vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N))).x;
// s.tangent.xy = vec2();
// a = (s.tangent.x + b) * s.tangent.z;
// if ((v_uv.x != a * b) ){
//   vec2 v_uv;
//   v_uv = vec2(1,1);
// }else{
//   vec2 v_uv;
//   v_uv = vec2(0,0);
// }
// vec2 stepTest = step(v_uv, v_uv);
// vec4 position;
// position = vec4(a_position, 1.0);
// position.xy = cc_cameraPos.w == 0.0 ? vec2(position.xy.x, -position.xy.y) : position.xy;
// gl_Position = vec4(position.x, position.y, 1.0, 1.0);
// v_uv = a_texCoord;
// if (v_uv.x < 0.5){
//   vec2 v_uv;
//   v_uv = vec2(1,1);
// }else{
//   vec2 v_uv;
//   v_uv = vec2(0,0);
// }
// v_uv.x = 1.;
// }`)
//# sourceMappingURL=GLSLInterpreter.js.map