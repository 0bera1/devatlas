import { Visibility } from '@prisma/client';
export declare class PatchDocumentDto {
    readonly title?: string;
    readonly visibility?: Visibility;
    readonly categoryName?: string | null;
}
