/** Merkezi API yöntem anahtarları (feature + işlem). Endpoint eşlemesi ilgili *Api.ts / http katmanında. */

export enum DocumentMethods {
  List = 'document:list',
  Create = 'document:create',
  GetById = 'document:getById',
  UpdateContent = 'document:updateContent',
  PatchTitle = 'document:patchTitle',
  Delete = 'document:delete',
}

export enum AuthMethods {
  Login = 'auth:login',
  Register = 'auth:register',
  Refresh = 'auth:refresh',
}
