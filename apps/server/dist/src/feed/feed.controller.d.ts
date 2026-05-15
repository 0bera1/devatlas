import type { DocumentRecord } from '../documents/interfaces/document-record.interface';
import { type IDocumentsService } from '../documents/interfaces/documents-service.interface';
export declare class FeedController {
    private readonly documentsService;
    constructor(documentsService: IDocumentsService);
    latest(): Promise<DocumentRecord[]>;
    trending(): Promise<DocumentRecord[]>;
}
