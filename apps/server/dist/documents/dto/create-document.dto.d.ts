import { Visibility } from '@prisma/client';
export declare class CreateDocumentDto {
    readonly title: string;
    readonly visibility?: Visibility;
    readonly tags?: string[];
    readonly categoryName?: string;
}
