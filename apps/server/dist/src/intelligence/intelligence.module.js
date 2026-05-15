"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const tech_keyword_extractor_1 = require("./auto-tag/tech-keyword-extractor");
const tech_keyword_extractor_interface_1 = require("./auto-tag/interfaces/tech-keyword-extractor.interface");
const architecture_template_matcher_1 = require("./diagram-generation/architecture-template-matcher");
const architecture_template_matcher_interface_1 = require("./diagram-generation/interfaces/architecture-template-matcher.interface");
const intelligence_controller_1 = require("./intelligence.controller");
const intelligence_repository_1 = require("./intelligence.repository");
const intelligence_service_1 = require("./intelligence.service");
const intelligence_repository_interface_1 = require("./interfaces/intelligence-repository.interface");
const intelligence_service_interface_1 = require("./interfaces/intelligence-service.interface");
const interview_question_repository_1 = require("./interview-questions/interview-question.repository");
const interview_question_repository_interface_1 = require("./interview-questions/interfaces/interview-question-repository.interface");
const intelligenceRepositoryProvider = {
    provide: intelligence_repository_interface_1.INTELLIGENCE_REPOSITORY,
    useClass: intelligence_repository_1.IntelligenceRepository,
};
const techKeywordExtractorProvider = {
    provide: tech_keyword_extractor_interface_1.TECH_KEYWORD_EXTRACTOR,
    useClass: tech_keyword_extractor_1.TechKeywordExtractor,
};
const architectureTemplateMatcherProvider = {
    provide: architecture_template_matcher_interface_1.ARCHITECTURE_TEMPLATE_MATCHER,
    useClass: architecture_template_matcher_1.ArchitectureTemplateMatcher,
};
const interviewQuestionRepositoryProvider = {
    provide: interview_question_repository_interface_1.INTERVIEW_QUESTION_REPOSITORY,
    useClass: interview_question_repository_1.InterviewQuestionRepository,
};
const intelligenceServiceProvider = {
    provide: intelligence_service_interface_1.INTELLIGENCE_SERVICE,
    useClass: intelligence_service_1.IntelligenceService,
};
let IntelligenceModule = class IntelligenceModule {
};
exports.IntelligenceModule = IntelligenceModule;
exports.IntelligenceModule = IntelligenceModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [intelligence_controller_1.IntelligenceController],
        providers: [
            intelligenceRepositoryProvider,
            techKeywordExtractorProvider,
            architectureTemplateMatcherProvider,
            interviewQuestionRepositoryProvider,
            intelligenceServiceProvider,
        ],
        exports: [intelligenceServiceProvider],
    })
], IntelligenceModule);
//# sourceMappingURL=intelligence.module.js.map