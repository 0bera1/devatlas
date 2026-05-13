export declare class SaveDiagramNodeBodyDto {
    readonly id: string;
    readonly label: string;
    readonly type: string;
    readonly x: number;
    readonly y: number;
    readonly width?: number;
    readonly height?: number;
}
export declare class SaveDiagramEdgeBodyDto {
    readonly from: string;
    readonly to: string;
    readonly label?: string;
    readonly type?: string;
    readonly animated?: boolean;
}
export declare class SaveDiagramBodyDto {
    readonly nodes: SaveDiagramNodeBodyDto[];
    readonly edges: SaveDiagramEdgeBodyDto[];
}
