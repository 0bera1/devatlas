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
  Delete = 'diagram:delete',
  Related = 'diagram:related',
  FavoriteDiagram = 'diagram:favoriteDiagram',
  ListCollaborators = 'diagram:listCollaborators',
  AddCollaborator = 'diagram:addCollaborator',
  RemoveCollaborator = 'diagram:removeCollaborator',
}

export enum ProfileMethods {
  GetMe = 'profile:getMe',
  UpdateMe = 'profile:updateMe',
  ChangePassword = 'profile:changePassword',
  FavoriteDocuments = 'profile:favoriteDocuments',
  FavoriteDiagrams = 'profile:favoriteDiagrams',
  Activity = 'profile:activity',
}

export enum SystemContentMethods {
  List = 'systemContent:list',
}

export enum IntelligenceMethods {
  GetDiagramResources = 'intelligence:getDiagramResources',
  GetAutoTags = 'intelligence:getAutoTags',
  GenerateDiagram = 'intelligence:generateDiagram',
  GetDocumentInterviewQuestions = 'intelligence:getDocumentInterviewQuestions',
}
