"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
exports.dynamic = "force-dynamic";
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
