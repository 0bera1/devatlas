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
exports.GenerateDiagramRequestDto = void 0;
const class_validator_1 = require("class-validator");
const architecture_templates_constant_1 = require("../diagram-generation/architecture-templates.constant");
class GenerateDiagramRequestDto {
    prompt;
}
exports.GenerateDiagramRequestDto = GenerateDiagramRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_MIN_PROMPT_LENGTH),
    (0, class_validator_1.MaxLength)(architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH),
    __metadata("design:type", String)
], GenerateDiagramRequestDto.prototype, "prompt", void 0);
//# sourceMappingURL=generate-diagram-request.dto.js.map