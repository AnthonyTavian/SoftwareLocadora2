"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaintenance = getMaintenance;
exports.saveMaintenance = saveMaintenance;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.join(electron_1.app.getPath("userData"), "maintenance.json");
function ensureFile() {
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, JSON.stringify([]));
    }
}
function getMaintenance() {
    ensureFile();
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
}
function saveMaintenance(data) {
    ensureFile();
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
