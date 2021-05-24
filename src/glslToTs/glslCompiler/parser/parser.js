"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArray = void 0;
var lib_1 = require("./lib");
function parseArray(tokens) {
    var parse = lib_1.parser();
    for (var i = 0; i < tokens.length; i++) {
        parse(tokens[i]);
    }
    return parse(null);
}
exports.parseArray = parseArray;
//# sourceMappingURL=parser.js.map