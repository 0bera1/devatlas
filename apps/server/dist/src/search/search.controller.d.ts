import type { PublicSearchHit } from '../documents/interfaces/public-search-hit.interface';
import { type IDocumentsService } from '../documents/interfaces/documents-service.interface';
import { type IDiagramsService } from '../diagrams/interfaces/diagrams-service.interface';
import { SearchQueryDto } from './dto/search-query.dto';
export declare class SearchController {
    private readonly documentsService;
    private readonly diagramsService;
    constructor(documentsService: IDocumentsService, diagramsService: IDiagramsService);
    search(query: SearchQueryDto): Promise<PublicSearchHit[]>;
}
