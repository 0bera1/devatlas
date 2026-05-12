export declare class SaveDiagramNodeBodyDto {
    readonly id: string;
    readonly label: string;
    readonly type: string;
    readonly x: number;
    readonly y: number;
}
export declare class SaveDiagramEdgeBodyDto {
    readonly from: string;
    readonly to: string;
    readonly label?: string;
}
export declare class SaveDiagramBodyDto {
    readonly nodes: SaveDiagramNodeBodyDto[];
    readonly edges: SaveDiagramEdgeBodyDto[];
}
