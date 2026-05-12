import { Visibility } from '@prisma/client';
export declare class CreateDiagramDto {
    readonly title: string;
    readonly visibility?: Visibility;
}
