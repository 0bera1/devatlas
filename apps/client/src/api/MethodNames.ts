/** Merkezi API yöntem anahtarları (feature + işlem). Endpoint eşlemesi ilgili *Api.ts / http katmanında. */

export enum AuthMethods {
  Login = 'auth:login',
  Register = 'auth:register',
  Refresh = 'auth:refresh',
  Profile = 'auth:profile',
}

export enum DocumentMethods {
  List = 'document:list',
  PublicFeed = 'document:publicFeed',
  Create = 'document:create',
  GetById = 'document:getById',
  UpdateContent = 'document:updateContent',
  PatchDocument = 'document:patchDocument',
  Delete = 'document:delete',
  RecordView = 'document:recordView',
  FavoriteDocument = 'document:favoriteDocument',
  Related = 'document:related',
}

export enum FeedMethods {
  Latest = 'feed:latest',
  Trending = 'feed:trending',
}

export enum SearchMethods {
  PublicDocuments = 'search:publicDocuments',
}

export enum DiagramMethods {
  List = 'diagram:list',
  Create = 'diagram:create',
  GetById = 'diagram:getById',
  SaveGraph = 'diagram:saveGraph',
  Patch = 'diagram:patch',
  Related = 'diagram:related',
  ListCollaborators = 'diagram:listCollaborators',
  AddCollaborator = 'diagram:addCollaborator',
  RemoveCollaborator = 'diagram:removeCollaborator',
}

export enum SystemContentMethods {
  List = 'systemContent:list',
}
