export interface RecordDocumentViewResponseDto {
  /** Bu istekte görüntülenme sayacı arttı mı */
  counted: boolean;
  /**
   * İstemci ilk kez anonim izliyorsa atanır; `localStorage`'a yazıp sonraki isteklerde
   * `X-Anonymous-Id` başlığında gönderin.
   */
  anonymousId?: string;
}
