"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deparseToTs = void 0;
var builtinAtt_1 = require("./builtinAtt");
var Nothing = "";
var WsManager = /** @class */ (function () {
    function WsManager(whitespace_enabled, indent_text) {
        if (whitespace_enabled === void 0) { whitespace_enabled = false; }
        if (indent_text === void 0) { indent_text = ""; }
        this.enabled = false;
        this.indent_text = "";
        this.level = 0;
        this.optional = null;
        this.enabled = whitespace_enabled;
        this.indent_text = indent_text;
        this.level = 0;
        this.tabcache = ["", indent_text, indent_text + indent_text, indent_text + indent_text + indent_text];
        this.optional = whitespace_enabled ? this.required : this.disabled;
    }
    WsManager.prototype.indent = function () {
        ++this.level;
    };
    WsManager.prototype.dedent = function () {
        --this.level;
    };
    WsManager.prototype.disabled = function () {
        return Nothing;
    };
    WsManager.prototype.required = function (c) {
        if (c === "\n" && this.enabled) {
            // 增加;一边ts对代码的重排处理
            c += this.tab();
        }
        return c;
    };
    WsManager.prototype.tab = function () {
        // yes, we're caching tabs.
        // why? well, every line is going to be calling this,
        // which would suck if we were indented a bunch in a block.
        if (this.tabcache[this.level]) {
            return this.tabcache[this.level];
        }
        var _ = "";
        for (var i = 0, len = this.level, o = this.indent_text; i < len; ++i) {
            _ += o;
        }
        return (this.tabcache[len] = _);
    };
    return WsManager;
}());
var needs_semicolon = {
    decl: true,
    return: true,
    break: true,
    continue: true,
    discard: true,
    precision: true,
    expr: true,
    "do-while": true,
    struct: true,
};
var builtinValue = {
    gl_FragData: "Vec4Data[]",
    gl_Position: "Vec4Data",
    gl_FragCoord: "Vec4Data",
    gl_FragDepth: "FloatData",
    gl_FrontFacing: "BoolData",
    gl_FragColor: "Vec4Data",
};
var convertToTsType = {
    int: "IntData",
    float: "FloatData",
    double: "FloatData",
    vec2: "Vec2Data",
    vec3: "Vec3Data",
    vec4: "Vec4Data",
    mat3: "Mat3Data",
    mat4: "Mat4Data",
    sampler2D: "IntData",
    samplerCube: "IntData[]",
    void: "void",
    bool: "BoolData",
};
var tsbuiltinOperationFunsWithReturn = {
    glAdd_N_N: "NumData",
    glAdd_N_V2: "Vec2Data",
    glAdd_N_V3: "Vec3Data",
    glAdd_N_V4: "Vec4Data",
    glAdd_V2_N: "Vec2Data",
    glAdd_V2_V2: "Vec2Data",
    glAdd_V3_N: "Vec3Data",
    glAdd_V3_V3: "Vec3Data",
    glAdd_V4_N: "Vec4Data",
    glAdd_V4_V4: "Vec4Data",
    glAddSet_N_N: "void",
    glAddSet_V2_N: "void",
    glAddSet_V2_V2: "void",
    glAddSet_V3_N: "void",
    glAddSet_V3_V3: "void",
    glAddSet_V4_N: "void",
    glAddSet_V4_V4: "void",
    glSub_N_N: "NumData",
    glSub_N_V2: "Vec2Data",
    glSub_N_V3: "Vec3Data",
    glSub_N_V4: "Vec4Data",
    glSub_V2_N: "Vec2Data",
    glSub_V2_V2: "Vec2Data",
    glSub_V3_N: "Vec3Data",
    glSub_V3_V3: "Vec3Data",
    glSub_V4_N: "Vec4Data",
    glSub_V4_V4: "Vec4Data",
    glSubSet_N_N: "void",
    glSubSet_V2_N: "void",
    glSubSet_V2_V2: "void",
    glSubSet_V3_N: "void",
    glSubSet_V3_V3: "void",
    glSubSet_V4_N: "void",
    glSubSet_V4_V4: "void",
    glMul_N_N: "NumData",
    glMul_N_V2: "Vec2Data",
    glMul_N_V3: "Vec3Data",
    glMul_N_V4: "Vec4Data",
    glMul_V2_N: "Vec2Data",
    glMul_V2_V2: "Vec2Data",
    glMul_V3_N: "Vec3Data",
    glMul_V3_V3: "Vec3Data",
    glMul_V4_N: "Vec4Data",
    glMul_V4_V4: "Vec4Data",
    glMul_M3_M3: "Mat3Data",
    glMul_M4_M4: "Mat4Data",
    glMulSet_N_N: "void",
    glMulSet_V2_N: "void",
    glMulSet_V2_V2: "void",
    glMulSet_V3_N: "void",
    glMulSet_V3_V3: "void",
    glMulSet_V4_N: "void",
    glMulSet_V4_V4: "void",
    glMul_M4_V4: "Vec4Data",
    glMul_V4_M4: "Vec4Data",
    glDiv_N_N: "NumData",
    glDiv_N_V2: "Vec2Data",
    glDiv_N_V3: "Vec3Data",
    glDiv_N_V4: "Vec4Data",
    glDiv_V2_N: "Vec2Data",
    glDiv_V2_V2: "Vec2Data",
    glDiv_V3_N: "Vec3Data",
    glDiv_V3_V3: "Vec3Data",
    glDiv_V4_N: "Vec4Data",
    glDiv_V4_V4: "Vec4Data",
    glDivSet_N_N: "void",
    glDivSet_V2_N: "void",
    glDivSet_V2_V2: "void",
    glDivSet_V3_N: "void",
    glDivSet_V3_V3: "void",
    glDivSet_V4_N: "void",
    glNegative_N: "NumData",
    glNegative_V2: "Vec2Data",
    glNegative_V3: "Vec3Data",
    glNegative_V4: "Vec4Data",
    glSet_N_N: "NumData",
    glSet_B_B: "BoolData",
    glSet_B_b: "BoolData",
    glSet_V2_V2: "Vec2Data",
    glSet_V3_V3: "Vec3Data",
    glSet_V4_V4: "Vec4Data",
    glSet_M3_M3: "Mat3Data",
    glSet_M4_M4: "Mat4Data",
    glSet_Struct_Struct: "any",
    glIsNotEqual_N_N: "boolean",
    glIsEqual_N_N: "boolean",
    glIsLessEqual_N_N: "boolean",
    glIsLess_N_N: "boolean",
    glIsMore_N_N: "boolean",
    glIsMoreEqual_N_N: "boolean",
    glFrontAddSelf_N: "NumData",
    glAfterAddSelf_N: "NumData",
    glFrontSubSelf_N: "NumData",
    glAfterSubSelf_N: "NumData",
    glFrontAddSelf_V2: "Vec2Data",
    glAfterAddSelf_V2: "Vec2Data",
    glFrontSubSelf_V2: "Vec2Data",
    glAfterSubSelf_V2: "Vec2Data",
    glFrontAddSelf_V3: "Vec3Data",
    glAfterAddSelf_V3: "Vec3Data",
    glFrontSubSelf_V3: "Vec3Data",
    glAfterSubSelf_V3: "Vec3Data",
    glFrontAddSelf_V4: "Vec4Data",
    glAfterAddSelf_V4: "Vec4Data",
    glFrontSubSelf_V4: "Vec4Data",
    glAfterSubSelf_V4: "Vec4Data",
    glFrontAddSelf_M3: "Mat3Data",
    glAfterAddSelf_M3: "Mat3Data",
    glFrontSubSelf_M3: "Mat3Data",
    glAfterSubSelf_M3: "Mat3Data",
    glFrontAddSelf_M4: "Mat4Data",
    glAfterAddSelf_M4: "Mat4Data",
    glFrontSubSelf_M4: "Mat4Data",
    glAfterSubSelf_M4: "Mat4Data",
    getValueKeyByIndex: "string",
};
var tsbuiltinFunsWithReturn = {
    radian_N: "NumData",
    radian_V2: "Vec2Data",
    radian_V3: "Vec3Data",
    radian_V4: "Vec4Data",
    degrees_N: "NumData",
    degrees_V2: "Vec2Data",
    degrees_V3: "Vec3Data",
    degrees_V4: "Vec4Data",
    sin_N: "NumData",
    sin_V2: "Vec2Data",
    sin_V3: "Vec3Data",
    sin_V4: "Vec4Data",
    cos_N: "NumData",
    cos_V2: "Vec2Data",
    cos_V3: "Vec3Data",
    cos_V4: "Vec4Data",
    tan_N: "NumData",
    tan_V2: "Vec2Data",
    tan_V3: "Vec3Data",
    tan_V4: "Vec4Data",
    asin_N: "NumData",
    asin_V2: "Vec2Data",
    asin_V3: "Vec3Data",
    asin_V4: "Vec4Data",
    acos_N: "NumData",
    acos_V2: "Vec2Data",
    acos_V3: "Vec3Data",
    acos_V4: "Vec4Data",
    atan_N: "NumData",
    atan_V2: "Vec2Data",
    atan_V3: "Vec3Data",
    atan_V4: "Vec4Data",
    atan_N_N: "NumData",
    atan_V2_V2: "Vec2Data",
    atan_V3_V3: "Vec3Data",
    atan_V4_V4: "Vec4Data",
    sinh_N: "NumData",
    sinh_V2: "Vec2Data",
    sinh_V3: "Vec3Data",
    sinh_V4: "Vec4Data",
    cosh_N: "NumData",
    cosh_V2: "Vec2Data",
    cosh_V3: "Vec3Data",
    cosh_V4: "Vec4Data",
    tanh_N: "NumData",
    tanh_V2: "Vec2Data",
    tanh_V3: "Vec3Data",
    tanh_V4: "Vec4Data",
    asinh_N: "NumData",
    asinh_V2: "Vec2Data",
    asinh_V3: "Vec3Data",
    asinh_V4: "Vec4Data",
    acosh_N: "NumData",
    acosh_V2: "Vec2Data",
    acosh_V3: "Vec3Data",
    acosh_V4: "Vec4Data",
    atanh_N: "NumData",
    atanh_V2: "Vec2Data",
    atanh_V3: "Vec3Data",
    atanh_V4: "Vec4Data",
    abs_N: "NumData",
    abs_V2: "Vec2Data",
    abs_V3: "Vec3Data",
    abs_V4: "Vec4Data",
    ceil_N: "NumData",
    ceil_V2: "Vec2Data",
    ceil_V3: "Vec3Data",
    ceil_V4: "Vec4Data",
    clamp_N_N_N: "NumData",
    clamp_V2_N_N: "Vec2Data",
    clamp_V3_N_N: "Vec3Data",
    clamp_V4_N_N: "Vec4Data",
    clamp_V2_V2_V2: "Vec2Data",
    clamp_V3_V3_V3: "Vec3Data",
    clamp_V4_V4_V4: "Vec4Data",
    mix_N_N_N: "NumData",
    mix_V2_V2_N: "Vec2Data",
    mix_V3_V3_N: "Vec3Data",
    mix_V4_V4_N: "Vec4Data",
    mix_V2_V2_V2: "Vec2Data",
    mix_V3_V3_V3: "Vec3Data",
    mix_V4_V4_V4: "Vec4Data",
    floor_N: "NumData",
    floor_V2: "Vec2Data",
    floor_V3: "Vec3Data",
    floor_V4: "Vec4Data",
    fract_N: "NumData",
    fract_V2: "Vec2Data",
    fract_V3: "Vec3Data",
    fract_V4: "Vec4Data",
    exp2_N: "NumData",
    exp2_V2: "Vec2Data",
    exp2_V3: "Vec3Data",
    exp2_V4: "Vec4Data",
    exp_N: "NumData",
    exp_V2: "Vec2Data",
    exp_V3: "Vec3Data",
    exp_V4: "Vec4Data",
    inversesqrt_N: "NumData",
    inversesqrt_V2: "Vec2Data",
    inversesqrt_V3: "Vec3Data",
    inversesqrt_V4: "Vec4Data",
    log_N: "NumData",
    log_V2: "Vec2Data",
    log_V3: "Vec3Data",
    log_V4: "Vec4Data",
    log2_N: "NumData",
    log2_V2: "Vec2Data",
    log2_V3: "Vec3Data",
    log2_V4: "Vec4Data",
    max_N_N: "NumData",
    max_V2_N: "Vec2Data",
    max_V3_N: "Vec3Data",
    max_V4_N: "Vec4Data",
    max_V2_V2: "Vec2Data",
    max_V3_V3: "Vec3Data",
    max_V4_V4: "Vec4Data",
    min_N_N: "NumData",
    min_V2_N: "Vec2Data",
    min_V3_N: "Vec3Data",
    min_V4_N: "Vec4Data",
    min_V2_V2: "Vec2Data",
    min_V3_V3: "Vec3Data",
    min_V4_V4: "Vec4Data",
    mod_N_N: "NumData",
    mod_V2_N: "Vec2Data",
    mod_V3_N: "Vec3Data",
    mod_V4_N: "Vec4Data",
    mod_V2_V2: "Vec2Data",
    mod_V3_V3: "Vec3Data",
    mod_V4_V4: "Vec4Data",
    pow_N_N: "NumData",
    pow_V2_V2: "Vec2Data",
    pow_V3: "Vec3Data",
    pow_V4: "Vec4Data",
    round_N: "NumData",
    round_V2: "Vec2Data",
    round_V3: "Vec3Data",
    round_V4: "Vec4Data",
    sign_N: "NumData",
    sign_V2: "Vec2Data",
    sign_V3: "Vec3Data",
    sign_V4: "Vec4Data",
    smoothstep_N_N_N: "NumData",
    smoothstep_V2_N_N: "Vec2Data",
    smoothstep_V3_N_N: "Vec3Data",
    smoothstep_V4_N_N: "Vec4Data",
    smoothstep_V2_V2_V2: "Vec2Data",
    smoothstep_V3_V3_V3: "Vec3Data",
    smoothstep_V4_V4_V4: "Vec4Data",
    sqrt_N: "NumData",
    sqrt_V2: "Vec2Data",
    sqrt_V3: "Vec3Data",
    sqrt_V4: "Vec4Data",
    step_N_N: "NumData",
    step_N_V2: "Vec2Data",
    step_N_V3: "Vec3Data",
    step_N_V4: "Vec4Data",
    step_V2_V2: "Vec2Data",
    step_V3_V3: "Vec3Data",
    step_V4_V4: "Vec4Data",
    trunc_N: "NumData",
    trunc_V2: "Vec2Data",
    trunc_V3: "Vec3Data",
    trunc_V4: "Vec4Data",
    cross_V3_V3: "Vec3Data",
    distance_N_N: "FloatData",
    distance_V2_V2: "FloatData",
    distance_V3_V3: "FloatData",
    distance_V4_V4: "FloatData",
    dot_N_N: "FloatData",
    dot_V2_V2: "FloatData",
    dot_V3_V3: "FloatData",
    dot_V4_V4: "FloatData",
    equal_N_N: "boolean",
    equal_V2_V2: "boolean",
    equal_V3_V3: "boolean",
    equal_V4_V4: "boolean",
    faceforward_N_N_N: "NumData",
    faceforward_V2_V2_V2: "Vec2Data",
    faceforward_V3_V3_V3: "Vec3Data",
    faceforward_V4_V4_V4: "Vec4Data",
    length_N: "FloatData",
    length_V2: "FloatData",
    length_V3: "FloatData",
    length_V4: "FloatData",
    normalize_N: "NumData",
    normalize_V2: "Vec2Data",
    normalize_V3: "Vec3Data",
    normalize_V4: "Vec4Data",
    notEqual_N_N: "boolean",
    notEqual_V2_V2: "boolean",
    notEqual_V3_V3: "boolean",
    notEqual_V4_V4: "boolean",
    reflect_N_N: "NumData",
    reflect_V2_V2: "Vec2Data",
    reflect_V3_V3: "Vec3Data",
    reflect_V4_V4: "Vec4Data",
    refract_N_N_N: "NumData",
    refract_V2_V2_N: "Vec2Data",
    refract_V3_V3_N: "Vec3Data",
    refract_V4_V4_N: "Vec4Data",
    determinant_M3: "FloatData",
    determinant_M4: "FloatData",
    inverse_M3: "Mat3Data",
    inverse_M4: "Mat4Data",
    int: "IntData",
    int_N: "IntData",
    float: "IntData",
    float_N: "FloatData",
    vec2: "Vec2Data",
    vec2_N: "Vec2Data",
    vec2_N_N: "Vec2Data",
    vec2_V2: "Vec2Data",
    vec3: "Vec3Data",
    vec3_N: "Vec3Data",
    vec3_N_N_N: "Vec3Data",
    vec3_V2_N: "Vec3Data",
    vec3_N_V2: "Vec3Data",
    vec3_V3: "Vec3Data",
    vec4: "Vec4Data",
    vec4_N: "Vec4Data",
    vec4_N_N_N_N: "Vec4Data",
    vec4_N_N_V2: "Vec4Data",
    vec4_N_V3: "Vec4Data",
    vec4_V2_N_N: "Vec4Data",
    vec4_V2_V2: "Vec4Data",
    vec4_V3_N: "Vec4Data",
    vec4_V4: "Vec4Data",
    mat3: "Mat3Data",
    mat3_N_N_N_N_N_N_N_N_N: "Mat3Data",
    mat3_M3: "Mat3Data",
    mat3_M4: "Mat3Data",
    mat3_V3_V3_V3: "Mat3Data",
    mat4: "Mat4Data",
    mat4_M3: "Mat4Data",
    mat4_M4: "Mat4Data",
    mat4_V4_V4_V4_V4: "Mat4Data",
    mat4_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N_N: "Mat4Data",
    texture2D_N_V2: "Vec4Data",
    textureCube_NA_V3: "Vec4Data",
};
var builtinFuns = {
    radian: true,
    degrees: true,
    sin: true,
    cos: true,
    tan: true,
    asin: true,
    acos: true,
    atan: true,
    sinh: true,
    cosh: true,
    tanh: true,
    asinh: true,
    acosh: true,
    atanh: true,
    abs: true,
    ceil: true,
    clamp: true,
    mix: true,
    floor: true,
    fract: true,
    exp2: true,
    exp: true,
    inversesqrt: true,
    log: true,
    log2: true,
    max: true,
    min: true,
    mod: true,
    pow: true,
    round: true,
    sign: true,
    smoothstep: true,
    sqrt: true,
    step: true,
    trunc: true,
    cross: true,
    distance: true,
    dot: true,
    equal: true,
    faceforward: true,
    length: true,
    normalize: true,
    notEqual: true,
    reflect: true,
    refract: true,
    determinant: true,
    inverse: true,
    int: true,
    float: true,
    vec2: true,
    vec3: true,
    vec4: true,
    mat3: true,
    mat4: true,
};
var builtinAbbreviation = {
    Vec2Data: "V2",
    "Vec2Data[]": "V2A",
    Vec3Data: "V3",
    "Vec3Data[]": "V3A",
    Vec4Data: "V4",
    "Vec4Data[]": "V4[]",
    Mat3Data: "M3",
    "Mat3Data[]": "M3A",
    Mat4Data: "M4",
    "Mat4Data[]": "M4A",
    FloatData: "N",
    "FloatData[]": "NA",
    IntData: "N",
    "IntData[]": "NA",
    NumData: "N",
    "NumData[]": "NA",
    number: "N",
    "number[]": "NA",
    BoolData: "B",
    "BoolData[]": "BA",
    boolean: "b",
    "boolean[]": "bA",
};
function convertToAbbreviation(str) {
    return builtinAbbreviation[str] || str;
}
var types = {
    binary: deparse_binary,
    break: deparse_break,
    builtin: deparse_builtin,
    continue: deparse_continue,
    decl: deparse_decl,
    decllist: deparse_decllist,
    discard: deparse_discard,
    "do-while": deparse_do_while,
    expr: deparse_expr,
    forloop: deparse_forloop,
    function: deparse_function,
    functionargs: deparse_functionargs,
    ident: deparse_ident,
    if: deparse_if,
    keyword: deparse_keyword,
    literal: deparse_literal,
    precision: deparse_precision,
    preprocessor: deparse_preprocessor,
    return: deparse_return,
    stmt: deparse_stmt,
    stmtlist: deparse_stmtlist,
    struct: deparse_struct,
    assign: deparse_assign,
    unary: deparse_unary,
    whileloop: deparse_whileloop,
    operator: deparse_operator,
    group: deparse_group,
    suffix: deparse_suffix,
    call: deparse_call,
    quantifier: deparse_quantifier,
    ternary: deparse_ternary,
};
var output = [];
var ws = null;
var nowTypeCach = "";
var nowFuncTypeCach = "";
var nowBlockLevel = 0;
var isFuncArgs = false;
var inForDefine = false;
var useBuiltinFuncs = new Set();
var useBuiltinOperators = new Set();
var inFunc = false;
var isFuncBlock = false;
var uniformData = new Map();
var varyingData = new Map();
var attributeData = new Map();
var structDataMap = new Map();
var defines;
var customFuns = new Map();
// 对应每一层块的变量 会往当前块往父节点块的变量查找 如果都找不到 那么会往类数据查找
// funcObj会记录对象名和类型
var nowFucObj = new Map();
function outputPush(str) {
    if (!isNaN(parseFloat(str))) {
        if (str.indexOf(".") !== -1) {
            str = "float_N(" + str + ")";
        }
        else {
            str = "int_N(" + str + ")";
        }
    }
    output.push(str);
}
function outputInsert(index, str) {
    output.splice(index, 0, str);
}
function outputDel(index, length) {
    output.splice(index, length);
}
function outputReplace(index, str) {
    output[index] = str;
}
function convertToClassObj(str) {
    var objStr;
    if (defines.get(str) !== undefined) {
        objStr = str;
    }
    else {
        objStr = uniformData.get(str);
        if (!objStr) {
            objStr = varyingData.get(str);
            if (!objStr) {
                objStr = attributeData.get(str);
                if (!objStr) {
                    objStr = str;
                }
                else {
                    objStr = "this.attributeData." + str;
                }
            }
            else {
                objStr = "this.varyingData." + str;
            }
        }
        else {
            objStr = "this.uniformData." + str;
        }
    }
    return objStr;
}
function getStructType(str) {
    var sd = structDataMap.get(str);
    return sd;
}
function deparse_binary(node) {
    if (!isFuncBlock) {
        return;
    }
    var is_bracket = node.data === "[";
    var operatorReplace = null;
    if (node.data == "+") {
        operatorReplace = "glAdd";
    }
    else if (node.data == "-") {
        operatorReplace = "glSub";
    }
    else if (node.data == "*") {
        operatorReplace = "glMul";
    }
    else if (node.data == "/") {
        operatorReplace = "glDiv";
    }
    else if (node.data == "!=") {
        operatorReplace = "glIsNotEqual";
    }
    else if (node.data == "<=") {
        operatorReplace = "glIsLessEqual";
    }
    else if (node.data == "<") {
        operatorReplace = "glIsLess";
    }
    else if (node.data == ">=") {
        operatorReplace = "glIsMoreEqual";
    }
    else if (node.data == ">") {
        operatorReplace = "glIsMore";
    }
    else if (node.data == "==") {
        operatorReplace = "glIsEqual";
    }
    else if (node.data == "[") {
    }
    else if (node.data == "||") {
    }
    else if (node.data == "&&") {
    }
    else {
        console.error("无法识别的binary类型");
        debugger;
    }
    var leftIndex = output.length;
    if (leftIndex == 2464) {
        debugger;
    }
    var leftType = deparse(node.children[0]);
    if (!leftType) {
        debugger;
    }
    var leftEnd = output.length;
    !is_bracket && !operatorReplace && outputPush(ws.optional(" "));
    var operatorIndex = output.length;
    outputPush(node.data);
    !is_bracket && !operatorReplace && outputPush(ws.optional(" "));
    var rightIndex = output.length;
    if (rightIndex == 205) {
        debugger;
    }
    var rightType = deparse(node.children[1]);
    if (!rightType) {
        debugger;
        var testType = deparse(node.children[1]);
    }
    if (is_bracket) {
        if (leftType == "Vec4Data" ||
            leftType == "Vec3Data" ||
            leftType == "Vec2Data" ||
            leftType == "Mat3Data" ||
            leftType == "Mat4Data") {
            // 如果坐变的对象也是通过中括号得来的话 说明是矩阵
            if (node.children[0].data !== "[") {
                outputInsert(leftEnd - 1, "(<any>");
                outputInsert(leftEnd + 1, ")");
                outputInsert(leftEnd + 3, "getValueKeyByIndex(");
                outputPush(")");
            }
            else {
                outputInsert(leftEnd + 1, "getValueKeyByIndex(");
                outputPush(")");
            }
        }
        else if (rightType == "NumData" || rightType == "IntData" || rightType == "FloatData") {
            outputPush(".v");
        }
    }
    var rightEnd = output.length;
    // console.log("*********************begin binary***************")
    // // 分析左边的类型
    // let str = ""
    // for (let index = leftIndex; index < leftEnd; index++) {
    //     str += output[index]
    // }
    // str += node.data
    // console.log(node.data)
    // for (let index = rightIndex; index < rightEnd; index++) {
    //     str += output[index]
    // }
    // console.log("leftLength:" + (leftEnd - leftIndex) + " rightLength:" + (rightEnd - rightIndex))
    // console.log("opeStr: " + str)
    // console.log("*********************end binary***************")
    if (operatorReplace) {
        operatorReplace = operatorReplace + "_" + convertToAbbreviation("" + leftType) + "_" + convertToAbbreviation("" + rightType);
        outputInsert(leftIndex, operatorReplace + "(");
        // // 因为左边插入了
        outputInsert(rightEnd + 1, ")");
        outputReplace(operatorIndex + 1, ",");
        useBuiltinOperators.add(operatorReplace);
    }
    if (is_bracket) {
        outputPush("]");
        if (leftType == "Vec4Data" || leftType == "Vec3Data" || leftType == "Vec2Data") {
            return "number";
        }
        else if (leftType == "Mat3Data") {
            return "Vec3Data";
        }
        else if (leftType == "Mat4Data") {
            return "Vec4Data";
        }
        else {
            //
            return leftType.substring(0, leftType.lastIndexOf("["));
        }
    }
    if (operatorReplace) {
        return tsbuiltinOperationFunsWithReturn[operatorReplace];
    }
    else {
        if (node.data == "||" || node.data == "&&") {
            return "boolean";
        }
    }
}
function deparse_break(node) {
    if (!isFuncBlock) {
        return;
    }
    outputPush("break");
}
function deparse_builtin(node) {
    if (!isFuncBlock) {
        return;
    }
    var parent = node.parent;
    var returnType;
    // 如果是内建函数
    if (parent.type == "call" && parent.children[0] == node) {
    }
    else {
        // 否则应该是内建变量
        returnType = builtinValue[node.data];
        // 如果不是内建變量 那麽可能是一個正常的变量
        if (returnType === undefined) {
            returnType = getObjType(node.data);
        }
    }
    outputPush(node.data);
    return returnType;
}
function deparse_continue(node) {
    if (!isFuncBlock) {
        return;
    }
    outputPush("continue");
}
function deparse_decl(node) {
    // it's five long
    if (!isFuncBlock) {
        return;
    }
    var len = node.children.length, len_minus_one = len - 1;
    var children = node.children;
    var hasFunc = false;
    for (var i = 0; i < len; ++i) {
        var child = children[i];
        if (child.type == "function") {
            hasFunc = true;
            break;
        }
    }
    var cachValType;
    for (var i = 0; i < len; ++i) {
        var child = children[i];
        if (child.type !== "placeholder") {
            if (child.type == "keyword" || child.type == "ident") {
                if (hasFunc) {
                    nowFuncTypeCach = child.token.data;
                }
                else {
                    nowTypeCach = child.token.data;
                    cachValType = nowTypeCach;
                }
                continue;
            }
            deparse(child);
            if (i !== len_minus_one) {
                outputPush(ws.required(" "));
            }
        }
    }
    return cachValType || nowFuncTypeCach;
}
function deparse_decllist(node) {
    if (!isFuncBlock) {
        return;
    }
    var tmpCachType = nowTypeCach;
    var decllistBegin = output.length;
    var setFunc = "glSet";
    if (tmpCachType == "int" || tmpCachType == "float" || tmpCachType == "double") {
        setFunc = "glSet_N_N";
    }
    else if (tmpCachType == "bool") {
        setFunc = "glSet_B_B";
    }
    else if (tmpCachType == "vec2") {
        setFunc = "glSet_V2_V2";
    }
    else if (tmpCachType == "vec3") {
        setFunc = "glSet_V3_V3";
    }
    else if (tmpCachType == "vec4") {
        setFunc = "glSet_V4_V4";
    }
    else if (tmpCachType == "mat3") {
        setFunc = "glSet_M3_M3";
    }
    else if (tmpCachType == "mat4") {
        setFunc = "glSet_M4_M4";
    }
    else {
        setFunc = "glSet_Struct_Struct";
    }
    var isSet = false;
    var setFuncIndex = 0;
    for (var i = 0, len = node.children.length; i < len; ++i) {
        isSet = false;
        if (i > 0) {
            if (node.children[i].type !== "ident") {
                if (node.children[i].type !== "quantifier") {
                    if (inForDefine) {
                        outputPush(ws.optional(" "));
                        outputPush("=");
                        outputPush(ws.optional(" "));
                    }
                    else {
                        setFuncIndex = output.length;
                        outputPush(setFunc + "(");
                        outputPush(node.children[i - 1].data);
                        outputPush(", ");
                        isSet = true;
                        useBuiltinOperators.add(setFunc);
                    }
                }
            }
            else {
                nowTypeCach = tmpCachType;
                outputPush(ws.required("\n"));
            }
        }
        var type = deparse(node.children[i]);
        if (isSet) {
            if (type == "boolean") {
                outputReplace(setFuncIndex, "glSet_B_b(");
                useBuiltinOperators.add("glSet_B_b");
            }
            outputPush(")");
        }
        // if (!isFuncArgs && tmpCachType !== "") {
        //     let nextNode = node.children[i + 1]
        //     // 查看是否有下一个
        //     if (nextNode && nextNode.type !== "ident" && nextNode.type !== "quantifier") {
        //         continue
        //     }
        //     if (node.children[i].type == "expr") {
        //         continue
        //     }
        //     outputPush(ws.optional(" "))
        //     outputPush("=")
        //     outputPush(ws.optional(" "))
        //     let sd = getStructType(tmpCachType)
        //     // 判断是否struct 类型
        //     if (sd) {
        //         outputPush(ws.optional("new " + tmpCachType + "()"))
        //     } else {
        //         outputPush(ws.optional(tmpCachType + "()"))
        //     }
        // }
    }
    // console.log("*********************begin decllist***************")
    // // 分析左边的类型
    // let str = ""
    // for (let index = decllistBegin; index < output.length; index++) {
    //     str += output[index]
    // }
    // console.log("decllistStr: " + str)
    // console.log("*********************end decllist***************")
}
function deparse_discard(node) {
    if (!isFuncBlock) {
        return;
    }
    outputPush("custom_isDiscard.v = true");
}
function deparse_do_while(node) {
    if (!isFuncBlock) {
        return;
    }
    var is_stmtlist = node.children[0].type === "stmtlist";
    outputPush("do");
    if (is_stmtlist) {
        outputPush(ws.optional(" "));
    }
    else {
        ws.indent();
        outputPush(ws.enabled ? ws.optional("\n") : ws.required(" "));
    }
    deparse(node.children[0]);
    if (is_stmtlist) {
        outputPush(ws.optional(" "));
    }
    else {
        ws.dedent();
        outputPush(ws.optional("\n"));
    }
    outputPush("while(");
    deparse(node.children[1]);
    outputPush(")");
}
function deparse_expr(node) {
    if (!isFuncBlock) {
        return;
    }
    if (node.children.length) {
        return deparse(node.children[0]);
    }
}
// 测试过for 里面的判断应该不能直接用bool变量
function deparse_forloop(node) {
    if (!isFuncBlock) {
        return;
    }
    var is_stmtlist = node.children[3].type === "stmtlist";
    outputPush("for(");
    inForDefine = true;
    deparse(node.children[0]);
    inForDefine = false;
    outputPush(";");
    outputPush(ws.optional(" "));
    deparse(node.children[1]);
    outputPush(";");
    outputPush(ws.optional(" "));
    deparse(node.children[2]);
    outputPush(")");
    if (is_stmtlist) {
        outputPush(ws.optional(" "));
    }
    else {
        ws.indent();
    }
    deparse(node.children[3]);
    if (!is_stmtlist) {
        ws.dedent();
    }
}
function deparse_function(node) {
    var funcIndex = output.length;
    deparse(node.children[0]);
    var funcName = output[output.length - 1];
    outputPush("(");
    var returnTypes = deparse(node.children[1]);
    var customName = funcName;
    if (returnTypes.length > 0) {
        for (var index = 0; index < returnTypes.length; index++) {
            var element = returnTypes[index];
            customName += "_" + (convertToAbbreviation(convertToTsType[element]) || element);
        }
    }
    outputPush(")");
    outputPush(": " + convertToTsType[nowFuncTypeCach]);
    customFuns.set(customName, nowFuncTypeCach);
    nowFuncTypeCach = "";
    outputReplace(funcIndex, customName);
    if (node.children[2]) {
        outputPush(ws.optional(" "));
        deparse(node.children[2]);
    }
}
function deparse_functionargs(node) {
    var len = node.children.length, len_minus_one = len - 1;
    isFuncArgs = true;
    var returnTypes = [];
    for (var i = 0; i < len; ++i) {
        var returnType = deparse(node.children[i]);
        returnTypes.push(returnType);
        if (i !== len_minus_one) {
            outputPush(",");
            outputPush(ws.optional(" "));
        }
    }
    isFuncArgs = false;
    return returnTypes;
}
function getFuncObjType(name) {
    for (var index = nowBlockLevel; index >= 0; index--) {
        var setData = nowFucObj.get(index);
        if (setData && setData.has(name)) {
            return setData.get(name);
        }
    }
    return null;
}
function deparse_ident(node) {
    if (nowTypeCach !== "") {
        if (inFunc) {
            outputPush("let ");
        }
        outputPush(node.data);
        var letType = convertToTsType[nowTypeCach] || nowTypeCach;
        outputPush(": " + letType);
        var setData = nowFucObj.get(nowBlockLevel);
        if (!setData) {
            setData = new Map();
            nowFucObj.set(nowBlockLevel, setData);
        }
        setData.set(node.data, letType);
        var grandParentNode = node.parent.parent;
        if (inFunc && !inForDefine) {
            outputPush(ws.optional(" "));
            outputPush("=");
            outputPush(ws.optional(" "));
            var sd = getStructType(nowTypeCach);
            // 判断是否struct 类型
            if (sd) {
                outputPush(ws.optional("new " + nowTypeCach + "()"));
            }
            else {
                outputPush(ws.optional(nowTypeCach + "()"));
            }
            outputPush("\n");
        }
        nowTypeCach = "";
    }
    else if (nowFuncTypeCach == "") {
        var isFuncObj = false;
        for (var index = nowBlockLevel; index >= 0; index--) {
            var setData = nowFucObj.get(index);
            if (setData && setData.has(node.data)) {
                isFuncObj = true;
                break;
            }
        }
        outputPush(isFuncObj ? node.data : convertToClassObj(node.data));
        return getObjType(output[output.length - 1]);
    }
    else {
        outputPush(node.data);
    }
}
function deparse_if(node) {
    var needs_indent = true;
    for (var j = 1; j < 4; ++j) {
        if (output[output.length - j] === "else") {
            output.length = output.length - j;
            outputPush("else ");
            break;
        }
        else if (/[^\s]/.test(output[output.length - j])) {
            break;
        }
    }
    var is_first_stmt = node.children[1].type === "stmt", has_second = node.children[2], is_second_stmt = has_second && node.children[2].children[0].type !== "stmtlist";
    outputPush("if(");
    var type = deparse(node.children[0]);
    if (type == "BoolData") {
        outputPush(".v)");
    }
    else {
        outputPush(")");
    }
    if (is_first_stmt) {
        needs_indent && ws.indent();
        // if语句不要加; 避免断句错误
        outputPush(ws.enabled ? ws.optional("\n", "") : ws.required(" "));
    }
    else {
        outputPush(ws.optional(" "));
    }
    var sonBlockIndex = output.length;
    deparse(node.children[1]);
    // gl 语句支持不加{ 但原则上ts中最好不要
    if (output[sonBlockIndex] !== "{") {
        outputReplace(sonBlockIndex, "{\n" + output[sonBlockIndex]);
        outputReplace(output.length - 1, output[output.length - 1] + "}\n");
    }
    if (is_first_stmt) {
        needs_indent && ws.dedent();
        outputPush(ws.optional("\n"));
    }
    if (has_second) {
        var is_if_stmt = node.children[2].children[0].type === "if";
        if (output[output.length - 1] === "}") {
            outputPush(ws.optional(" "));
        }
        outputPush("else");
        if (is_second_stmt) {
            !is_if_stmt && ws.indent();
            outputPush(ws.enabled ? ws.optional("\n") : ws.required(" "));
        }
        else {
            outputPush(ws.optional(" "));
        }
        deparse(node.children[2]);
        if (is_second_stmt) {
            !is_if_stmt && ws.dedent();
            outputPush(ws.optional("\n"));
        }
    }
}
function deparse_keyword(node) {
    outputPush(node.token.data);
    if (node.token.data == "true" || node.token.data == "false") {
        return "boolean";
    }
}
function deparse_literal(node) {
    outputPush(node.data);
    return getObjType(output[output.length - 1]);
}
function deparse_precision(node) {
    if (!isFuncBlock) {
        return;
    }
    var len = node.children.length, len_minus_one = len - 1;
    outputPush("precision");
    outputPush(ws.required(" "));
    for (var i = 0; i < len; ++i) {
        deparse(node.children[i]);
        if (i !== len_minus_one) {
            outputPush(ws.required(" "));
        }
    }
}
function deparse_preprocessor(node) {
    var level = ws.level;
    ws.level = 0;
    if (output[output.length - 1] !== "\n")
        outputPush(ws.required("\n"));
    outputPush(node.token.data);
    outputPush(ws.required("\n"));
    ws.level = level;
}
function deparse_return(node) {
    outputPush("return");
    if (node.children[0]) {
        outputPush(ws.required(" "));
        deparse(node.children[0]);
    }
}
function deparse_stmt(node) {
    if (!node.children.length)
        return;
    var has_child = node.children.length > 0, semicolon = has_child ? needs_semicolon[node.children[0].type] : "", needs_newline = true;
    var isFunSet = false;
    if (has_child && node.children[0].type === "decl") {
        if (node.children[0].children.length > 5 && node.children[0].children[5].type === "function") {
            isFunSet = true;
            isFuncBlock = true;
            semicolon = !node.children[0].children[5].children[2];
        }
    }
    if (has_child && node.children[0].type === "stmtlist") {
        needs_newline = false;
    }
    var last = output[output.length - 1];
    if (isFuncBlock && (!last || last.charAt(0) !== "\n")) {
        needs_newline && outputPush(ws.optional("\n"));
    }
    deparse(node.children[0]);
    if (isFuncBlock) {
        if (semicolon)
            outputPush(";");
    }
    if (isFunSet) {
        isFuncBlock = false;
    }
}
function deparse_stmtlist(node) {
    var has_parent = node.parent !== null && node.parent !== undefined;
    if (has_parent) {
        inFunc = true;
        outputPush("{");
        nowBlockLevel++;
        ws.indent();
        outputPush(ws.optional("\n"));
    }
    for (var i = 0, len = node.children.length; i < len; ++i) {
        deparse(node.children[i]);
    }
    if (has_parent) {
        nowFucObj.delete(nowBlockLevel);
        nowBlockLevel--;
        if (nowBlockLevel == 0) {
            inFunc = false;
            nowFucObj.delete(nowBlockLevel);
        }
        ws.dedent();
        outputPush(ws.optional("\n"));
        outputPush("}");
    }
}
function deparse_struct(node) {
    if (!isFuncBlock) {
        return;
    }
    outputPush("struct");
    outputPush(ws.required(" "));
    deparse(node.children[0]);
    outputPush(ws.optional(" "));
    outputPush("{");
    ws.indent();
    outputPush(ws.optional("\n"));
    var len = node.children.length, len_minus_one = len - 1;
    for (var i = 1, len = node.children.length; i < len; ++i) {
        deparse(node.children[i]);
        if (node.children[i].type !== "preprocessor") {
            outputPush(";");
        }
        if (i !== len_minus_one) {
            outputPush(ws.optional("\n"));
        }
    }
    ws.dedent();
    outputPush(ws.optional("\n"));
    outputPush("}");
}
function deparse_assign(node) {
    if (!isFuncBlock) {
        return;
    }
    var glOpetatior;
    if (node.token.data == "+=") {
        glOpetatior = "glAddSet";
    }
    else if (node.token.data == "-=") {
        glOpetatior = "glSubSet";
    }
    else if (node.token.data == "*=") {
        glOpetatior = "glMulSet";
    }
    else if (node.token.data == "/=") {
        glOpetatior = "glDivSet";
    }
    else if (node.token.data == "=") {
        glOpetatior = "glSet";
    }
    else {
        console.error("无法识别的assign类型");
        debugger;
    }
    var leftBeginIndex = output.length;
    var leftAssignType = deparse(node.children[0]);
    var leftEndIndex = output.length;
    outputPush(ws.optional(" "));
    var operatorIndex = output.length;
    outputPush(node.token.data);
    outputPush(ws.optional(" "));
    var rightBeginIndex = output.length;
    // if (rightBeginIndex == 154) {
    //     debugger
    // }
    var rightAssignType = deparse(node.children[1]);
    var returnType;
    if (leftAssignType == "number") {
        if (rightAssignType == "NumData" || rightAssignType == "FloatData" || rightAssignType == "IntData") {
            outputPush(".v");
            glOpetatior = null;
            returnType = "number";
        }
        else if (rightAssignType == "number") {
            // 俩边都是number 没必要重写操作符
            glOpetatior = null;
            returnType = "number";
        }
    }
    var rightEndIndex = output.length;
    if (glOpetatior) {
        glOpetatior = glOpetatior + "_" + convertToAbbreviation("" + leftAssignType) + "_" + convertToAbbreviation("" + rightAssignType);
        outputInsert(leftBeginIndex, glOpetatior + "(");
        // // 因为左边插入了
        outputInsert(rightEndIndex + 1, ")");
        outputReplace(operatorIndex + 1, ",");
        if (glOpetatior.indexOf("undefined") !== -1) {
            debugger;
        }
        useBuiltinOperators.add(glOpetatior);
        return tsbuiltinOperationFunsWithReturn[glOpetatior];
    }
    else {
        return returnType;
    }
}
function deparse_unary(node) {
    if (!isFuncBlock) {
        return;
    }
    var operatorReplace;
    if (node.data == "-") {
        operatorReplace = "glNegative";
    }
    else if (node.data == "--") {
        operatorReplace = "glFrontSubSelf";
    }
    else if (node.data == "++") {
        operatorReplace = "glFrontAddSelf";
    }
    else {
        console.log("无法识别的一元运算符");
        debugger;
    }
    var beginIndex = output.length;
    outputPush(node.data);
    var deparseType = deparse(node.children[0]);
    if (operatorReplace) {
        operatorReplace = operatorReplace + "_" + convertToAbbreviation("" + deparseType);
        outputInsert(beginIndex, operatorReplace + "(");
        // // 因为左边插入了
        outputDel(beginIndex + 1, 1);
        outputPush(")");
        useBuiltinOperators.add(operatorReplace);
    }
    return deparseType;
}
function deparse_whileloop(node) {
    if (!isFuncBlock) {
        return;
    }
    var is_stmtlist = node.children[1].type === "stmtlist";
    outputPush("while(");
    deparse(node.children[0]);
    outputPush(")");
    outputPush(is_stmtlist ? ws.optional(" ") : ws.required(" "));
    deparse(node.children[1]);
}
function deparse_call(node) {
    if (!isFuncBlock) {
        return;
    }
    var len = node.children.length, len_minus_one = len - 1;
    var firstChildData = node.children[0];
    if (firstChildData.type != "builtin" && !builtinFuns[firstChildData.data]) {
        outputPush("this.");
    }
    var funIndex = output.length;
    if (funIndex === 83) {
        debugger;
    }
    deparse(firstChildData);
    outputPush("(");
    var callParamsType = [];
    for (var i = 1; i < len; ++i) {
        var childBegin = output.length;
        if (childBegin == 3788) {
            debugger;
        }
        var nowObjType = deparse(node.children[i]);
        if (!nowObjType) {
            console.log("error in call");
            debugger;
            var test = deparse(node.children[i]);
        }
        var childEnd = output.length;
        callParamsType.push(convertToAbbreviation("" + nowObjType));
        if (i !== len_minus_one) {
            outputPush(",");
            outputPush(ws.optional(" "));
        }
    }
    var tsFuncName = output[funIndex];
    if (callParamsType.length) {
        tsFuncName += "_" + callParamsType.join("_");
    }
    outputReplace(funIndex, tsFuncName);
    outputPush(")");
    var returnType = tsbuiltinFunsWithReturn[tsFuncName] || "";
    if (returnType) {
        useBuiltinFuncs.add(tsFuncName);
    }
    else {
        returnType = customFuns.get(tsFuncName);
        returnType = convertToTsType[returnType] || returnType;
    }
    if (!returnType) {
        debugger;
        console.error("无法获取调用的返回类型");
    }
    return returnType;
}
function getObjType(element) {
    var nowObjType;
    if (element.indexOf("int(") == -1 &&
        element.indexOf("float(") == -1 &&
        element.indexOf("int_N(") == -1 &&
        element.indexOf("float_N(") == -1) {
        // 应该优先先查找块定义内的中的
        nowObjType = getFuncObjType(element);
        if (nowObjType) {
            return nowObjType;
        }
        // 查找是否内建变量
        nowObjType = builtinValue[element];
        if (nowObjType) {
            return nowObjType;
        }
        var myIndex = element.indexOf("this.attributeData.");
        if (myIndex !== -1) {
            return convertToTsType[attributeData.get(element.substring(myIndex + "this.attributeData.".length))];
        }
        myIndex = element.indexOf("this.varyingData.");
        if (myIndex !== -1) {
            return (nowObjType = convertToTsType[varyingData.get(element.substring(myIndex + "this.varyingData.".length))]);
        }
        myIndex = element.indexOf("this.uniformData.");
        if (myIndex !== -1) {
            return (nowObjType = uniformData.get(element.substring(myIndex + "this.uniformData.".length)));
        }
        nowObjType = defines.get(element);
        if (nowObjType !== undefined) {
            if (!isNaN(parseFloat(nowObjType))) {
                nowObjType = "number";
            }
            else {
                debugger;
                nowObjType = "string";
            }
        }
        return nowObjType;
    }
    else {
        nowObjType = "NumData";
    }
    return nowObjType;
}
function getSonObjType(element, parentObjType) {
    var nowObjType;
    // 先检查是否内置类型 在检查struct类型
    var dataAtt = builtinAtt_1.builtinDataAtt[parentObjType];
    // 内置类型
    if (dataAtt) {
        nowObjType = dataAtt.att[element];
    }
    else {
        var sd = getStructType(parentObjType);
        if (sd) {
            var att = sd.get(element);
            if (att) {
                nowObjType = att;
            }
        }
    }
    return nowObjType;
}
function deparse_operator(node) {
    if (!isFuncBlock) {
        return;
    }
    var beginIndex = output.length;
    var leftOperatorType = deparse(node.children[0]);
    outputPush(node.data);
    var rightOperatorType = deparse(node.children[1]);
    var isTop = false;
    var callTree = [];
    var isCallTree = true;
    for (var t = output.length - 1; t >= 0; t--) {
        var code = output[t];
        if (isCallTree) {
            isCallTree = false;
            callTree.push(code);
        }
        else {
            if (code == ".") {
                isCallTree = true;
            }
            else {
                isTop = t == beginIndex - 1;
                break;
            }
        }
    }
    var nowObjType;
    for (var index = callTree.length - 1; index >= 0; index--) {
        var element = callTree[index];
        if (index == callTree.length - 1) {
            nowObjType = getObjType(element);
        }
        else {
            nowObjType = getSonObjType(element, nowObjType);
        }
    }
    if (!nowObjType) {
        nowObjType = getSonObjType(node.children[1].data, leftOperatorType);
        isTop = true;
    }
    if (!nowObjType) {
        nowObjType = leftOperatorType;
        console.error("error get obj");
        debugger;
    }
    if (nowObjType == "number") {
        if (isTop) {
            if (
            // 如果是赋值语句的话不用进行变量转换
            !((node.parent.data == "=" ||
                node.parent.data == "+=" ||
                node.parent.data == "-=" ||
                node.parent.data == "*=" ||
                node.parent.data == "/=") &&
                node == node.parent.children[0])) {
                outputInsert(beginIndex, "float_N(");
                outputPush(")");
                nowObjType = "NumData";
            }
        }
    }
    return nowObjType;
}
function deparse_group(node) {
    if (!isFuncBlock) {
        return;
    }
    outputPush("(");
    var type = deparse(node.children[0]);
    outputPush(")");
    return type;
}
function deparse_suffix(node) {
    if (!isFuncBlock) {
        return;
    }
    var glOperation;
    if (node.data == "++") {
        glOperation = "glAfterAddSelf";
    }
    else if (node.data == "--") {
        glOperation = "glFrontSubSelf";
    }
    else {
        console.error("无法识别的suffix 语句");
        debugger;
    }
    var beginIndex = output.length;
    var type = deparse(node.children[0]);
    if (glOperation) {
        glOperation = glOperation + "_" + convertToAbbreviation("" + type);
        outputInsert(beginIndex, glOperation + "(");
        // // 因为左边插入了
        outputPush(")");
        useBuiltinOperators.add(glOperation);
    }
    else {
        outputPush(node.data);
    }
}
function deparse_quantifier(node) {
    if (!isFuncBlock) {
        return;
    }
    debugger;
    outputPush("[");
    if (node.children[0])
        deparse(node.children[0]);
    outputPush("]");
}
function deparse_ternary(node) {
    if (!isFuncBlock) {
        return;
    }
    deparse(node.children[0]);
    outputPush(ws.optional(" "));
    outputPush("?");
    outputPush(ws.optional(" "));
    var type1 = deparse(node.children[1]);
    outputPush(ws.optional(" "));
    outputPush(":");
    outputPush(ws.optional(" "));
    var type2 = deparse(node.children[2]);
    return type1 || type2;
}
function deparse(ast) {
    var func = types[ast.type];
    return func(ast);
}
function splitArrData(str) {
    var data = {};
    var arrIndex = str.indexOf("[");
    data.factObjName = "";
    var arrNum = 0;
    if (arrIndex !== -1) {
        data.factObjName = str.substring(0, arrIndex);
        var numOrDefineStr = str.substring(arrIndex + 1, str.indexOf("]"));
        arrNum = parseInt(numOrDefineStr);
        if (isNaN(arrNum)) {
            arrNum = defines.get(numOrDefineStr);
        }
    }
    else {
        data.factObjName = str;
    }
    data.arrNum = arrNum;
    return data;
}
function deparseToTs(ast, whitespace_enabled, indent_text, ud, vd, ad, sdm, d, isVert, hash) {
    if (whitespace_enabled === void 0) { whitespace_enabled = false; }
    if (indent_text === void 0) { indent_text = "  "; }
    if (isVert === void 0) { isVert = false; }
    output.length = 0;
    ws = new WsManager(whitespace_enabled, indent_text);
    nowFuncTypeCach = "";
    nowTypeCach = "";
    inFunc = false;
    isFuncArgs = false;
    inForDefine = false;
    uniformData = ud;
    varyingData = vd;
    attributeData = ad;
    structDataMap = sdm;
    defines = d;
    nowFucObj = new Map();
    useBuiltinFuncs = new Set();
    useBuiltinOperators = new Set();
    var attributeStr = "class AttributeDataImpl implements AttributeData {\n";
    attributeData.forEach(function (value, key) {
        var convertType = convertToTsType[value];
        if (convertType) {
            var arrData = splitArrData(key);
            var factObjName = arrData.factObjName;
            if (arrData && arrData.arrNum > 0) {
                console.error("attribute 变量暂不支持数组");
            }
            attributeStr += "    " + key + ": " + convertType + " = null!\n";
        }
        else {
            console.error("不识别的shader 数据结构: " + value);
        }
    });
    attributeStr += "}\n";
    var varingStr = "class VaringDataImpl extends VaringData {\n";
    var dataKeysStr = "    dataKeys: Map<string, any> = new Map([\n";
    var copyFuncStr = "    copy(varing: VaringDataImpl) {\n";
    varyingData.forEach(function (value, key) {
        var convertType = convertToTsType[value];
        if (convertType) {
            varingStr += "    " + key + ": " + convertType + " = new " + convertType + "()\n";
            dataKeysStr += "        [\"" + key + "\", <any>" + convertType + "],\n";
            copyFuncStr += "        varing." + key + ".set(this." + key + ")\n";
        }
        else {
            console.error("不识别的shader 数据结构: " + value);
        }
    });
    dataKeysStr += "    ])\n";
    varingStr += dataKeysStr + copyFuncStr + "    }\n";
    varingStr += "}\n";
    // 对uniform和struct中的数组对象进行处理
    var tmpUniformData = new Map();
    var uniformStr = "class UniformDataImpl implements UniformData {\n";
    uniformData.forEach(function (value, key) {
        var convertType = convertToTsType[value];
        if (convertType) {
            var arrData = splitArrData(key);
            var factObjName = arrData.factObjName;
            tmpUniformData.set(factObjName, "" + convertType + (arrData.arrNum > 0 ? "[]" : ""));
            uniformStr += "    " + factObjName + ": " + convertType + (arrData.arrNum > 0 ? "[]" : "") + " = null!\n";
        }
        else {
            console.error("不识别的shader 数据结构: " + value);
        }
    });
    uniformStr += "}\n";
    uniformData = tmpUniformData;
    var structStr = "";
    var tmpStructDataMap = new Map();
    structDataMap.forEach(function (value, key) {
        structStr += "class " + key + " implements StructData {\n";
        var tmpStructValue = new Map();
        tmpStructDataMap.set(key, tmpStructValue);
        value.forEach(function (objType, objName) {
            var arrData = splitArrData(objName);
            var factObjName = arrData.factObjName;
            var convertType = convertToTsType[objType];
            if (arrData.arrNum > 0) {
                tmpStructValue.set(factObjName, convertType + "[]");
                structStr += "    " + factObjName + ": " + convertType + "[] = [";
                for (var index = 0; index < arrData.arrNum; index++) {
                    if (index !== arrData.arrNum - 1) {
                        structStr += "new " + convertType + "(),";
                    }
                    else {
                        structStr += "new " + convertType + "()]\n";
                    }
                }
            }
            else {
                tmpStructValue.set(factObjName, "" + convertType);
                structStr += "    " + factObjName + ": " + convertType + " = new " + convertType + "()\n";
            }
        });
        structStr += "}\n";
    });
    structDataMap = tmpStructDataMap;
    deparse(ast);
    var tsScript = output.join("");
    tsScript = tsScript.replace(/\n/g, "\n    ") + "\n";
    if (isVert) {
        tsScript = "    attributeData: AttributeDataImpl = new AttributeDataImpl()\n" + tsScript;
        tsScript = "    uniformData: UniformDataImpl = new UniformDataImpl()\n" + tsScript;
        tsScript = "    varyingData: VaringDataImpl = new VaringDataImpl()\n" + tsScript;
    }
    else {
        tsScript = "    uniformData: UniformDataImpl = new UniformDataImpl()\n" + tsScript;
        tsScript = "    varyingData: VaringDataImpl = new VaringDataImpl()\n" + tsScript;
    }
    tsScript = "export class Impl_" + hash + " extends " + (isVert ? "VertShaderHandle" : "FragShaderHandle") + "{\n" + tsScript + "}\n";
    console.log(hash);
    var defineStr = "";
    defines.forEach(function (value, key) {
        if (!isNaN(parseFloat(value))) {
            defineStr += "const " + key + " = new FloatData(" + value + ")\n";
        }
        else {
            defineStr += "const " + key + " = \"" + value + "\"\n";
        }
    });
    tsScript = defineStr + structStr + attributeStr + varingStr + uniformStr + tsScript;
    var importStr = "import {\n";
    useBuiltinFuncs.add("float");
    useBuiltinFuncs.add("float_N");
    useBuiltinFuncs.add("bool");
    useBuiltinFuncs.add("bool_N");
    useBuiltinFuncs.add("int_N");
    useBuiltinFuncs.add("int");
    useBuiltinFuncs.add("vec4");
    useBuiltinFuncs.add("vec3");
    useBuiltinFuncs.add("vec2");
    useBuiltinFuncs.add("mat3");
    useBuiltinFuncs.add("mat4");
    useBuiltinFuncs.forEach(function (funNames) {
        importStr += "    " + funNames + ",\n";
    });
    importStr += "} from \"./builtin/BuiltinFunc\"\n";
    importStr += "import {\n";
    useBuiltinOperators.add("getValueKeyByIndex");
    useBuiltinOperators.forEach(function (funNames) {
        importStr += "    " + funNames + ",\n";
    });
    importStr += "} from \"./builtin/BuiltinOperator\"\n";
    importStr += "import { gl_FragData, gl_FragColor, gl_Position, gl_FragCoord, gl_FragDepth, gl_FrontFacing, custom_isDiscard} from \"./builtin/BuiltinVar\"\n";
    return importStr + tsScript;
}
exports.deparseToTs = deparseToTs;
//# sourceMappingURL=deparserToTs.js.map