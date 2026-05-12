/** Merkezi API yöntem anahtarları (feature + işlem). Endpoint eşlemesi ilgili *Api.ts / http katmanında. */

export enum DocumentMethods {
  List = 'document:list',
  PublicFeed = 'document:publicFeed',
  Create = 'document:create',
  GetById = 'document:getById',
  UpdateContent = 'document:updateContent',
  PatchDocument = 'document:patchDocument',
  Delete = 'document:delete',
}

export enum AuthMethods {
  Login = 'auth:login',
  Register = 'auth:register',
  Refresh = 'auth:refresh',
  Profile = 'auth:profile',
}

export enum SystemContentMethods {
  List = 'systemContent:list',
}
