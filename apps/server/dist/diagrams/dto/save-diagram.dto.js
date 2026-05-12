"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveDiagramBodyDto = exports.SaveDiagramEdgeBodyDto = exports.SaveDiagramNodeBodyDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SaveDiagramNodeBodyDto {
    id;
    label;
    type;
    x;
    y;
}
exports.SaveDiagramNodeBodyDto = SaveDiagramNodeBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], SaveDiagramNodeBodyDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SaveDiagramNodeBodyDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['text', 'db', 'service', 'api']),
    __metadata("design:type", String)
], SaveDiagramNodeBodyDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDiagramNodeBodyDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDiagramNodeBodyDto.prototype, "y", void 0);
class SaveDiagramEdgeBodyDto {
    from;
    to;
    label;
}
exports.SaveDiagramEdgeBodyDto = SaveDiagramEdgeBodyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], SaveDiagramEdgeBodyDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], SaveDiagramEdgeBodyDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SaveDiagramEdgeBodyDto.prototype, "label", void 0);
class SaveDiagramBodyDto {
    nodes;
    edges;
}
exports.SaveDiagramBodyDto = SaveDiagramBodyDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaveDiagramNodeBodyDto),
    __metadata("design:type", Array)
], SaveDiagramBodyDto.prototype, "nodes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaveDiagramEdgeBodyDto),
    __metadata("design:type", Array)
], SaveDiagramBodyDto.prototype, "edges", void 0);
//# sourceMappingURL=save-diagram.dto.js.map