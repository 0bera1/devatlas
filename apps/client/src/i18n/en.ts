import type { MessageKey } from './tr';

export const enMessages: Record<MessageKey, string> = {
  'nav.brand': 'DevAtlas',
  'nav.documents': 'Documents',
  'nav.login': 'Log in',
  'nav.register': 'Sign up',
  'nav.logout': 'Log out',
  'nav.sessionActive': 'Signed in',
  'nav.loading': '…',
  'nav.explore': 'Explore',
  'nav.knowledge': 'Knowledge base',

  'common.loading': 'Loading…',

  'home.title': 'Welcome',
  'home.introBefore': 'When signed in, use the',
  'home.introAfterDocs':
    'page to create and edit your notes. For authentication, use',
  'home.introBetweenAuth': 'or',
  'home.introAfterAuth': 'from the menu above.',
  'home.publicFeedBefore': 'Public notes are listed in',
  'home.publicFeedLink': 'Explore',
  'home.publicFeedMid': '; system and help texts are in the',
  'home.knowledgeLink': 'Knowledge base',
  'home.publicFeedAfter': '.',

  'auth.backHome': '← Home',
  'auth.login.title': 'Welcome to DevAtlas',
  'auth.login.description': 'Sign in to continue to your workspace.',
  'auth.login.footerText': "Don't have an account?",
  'auth.login.footerLink': 'Sign up',
  'auth.login.email': 'Email',
  'auth.login.password': 'Password',
  'auth.login.submit': 'Log in',
  'auth.login.submitting': 'Signing in…',
  'auth.login.forgotPassword': 'Forgot password?',
  'auth.forgotPasswordSoon': 'Password recovery is coming soon.',

  'auth.password.show': 'Show password',
  'auth.password.hide': 'Hide password',

  'auth.register.title': 'Join DevAtlas',
  'auth.register.description':
    'Create an account; you will be signed in automatically.',
  'auth.register.footerText': 'Already have an account?',
  'auth.register.footerLink': 'Log in',
  'auth.register.passwordHint': 'At least 8 characters.',
  'auth.register.name': 'Name (optional)',
  'auth.register.birthDate': 'Date of birth',
  'auth.register.submit': 'Sign up',
  'auth.register.submitting': 'Creating account…',

  'auth.or': 'Or',
  'auth.social.google': 'Continue with Google',
  'auth.social.googleSoon': 'Google sign-in is coming soon.',

  'auth.split.signUp': 'Sign up',
  'auth.split.logIn': 'Log in',
  'auth.split.ctaJoin': 'Join us',
  'auth.split.ctaLogin': 'Sign in',

  'auth.hero.name': 'DevAtlas',
  'auth.hero.tagline': 'Notes & knowledge base',

  'documents.list.title': 'Documents',
  'documents.list.intro':
    'Browse, search, and open a document to edit. The editor is plain text for now; the roadmap shows what comes next.',
  'documents.list.refresh': 'Refresh',
  'documents.list.newDoc': 'New document',
  'documents.list.titleLabel': 'Title',
  'documents.list.titlePlaceholder': 'Title…',
  'documents.list.create': 'Create',
  'documents.list.creating': 'Creating…',
  'documents.list.searchSection': 'Search & paging',
  'documents.list.searchPlaceholder': 'Search in title…',
  'documents.list.search': 'Search',
  'documents.list.clear': 'Clear',
  'documents.list.pageSize': 'Page size',
  'documents.list.total': 'Total',
  'documents.list.loadingList': 'Loading list…',
  'documents.list.skeleton': 'Loading documents',
  'documents.list.emptyTitle': 'No documents yet',
  'documents.list.emptySubtitle':
    'Create your first note above — it is saved to the API as soon as you add a title.',
  'documents.list.emptySearch':
    'No documents match your search. Try another keyword or clear the search.',
  'documents.list.empty':
    'No documents yet, or no search results. Create a new one above.',
  'documents.list.updated': 'Updated',
  'documents.list.prev': 'Previous',
  'documents.list.next': 'Next',
  'documents.list.page': 'Page',
  'documents.list.visibilityLabel': 'Visibility',
  'documents.visibilityPublic': 'Public',
  'documents.visibilityPrivate': 'Private',

  'explore.title': 'Explore',
  'explore.intro':
    'Documents marked as public in the community. You must sign in to open the full text.',
  'explore.empty': 'There are no public documents yet.',
  'explore.hintLogin': 'To open a document:',
  'explore.updated': 'Updated',

  'knowledge.title': 'Knowledge base',
  'knowledge.intro':
    'System and help content from the platform (no sign-in required).',
  'knowledge.empty': 'No system content to show.',

  'documents.editor.loading': 'Loading…',
  'documents.editor.loadingDoc': 'Loading document…',
  'documents.editor.notFound': 'Document not found.',
  'documents.editor.loadFailed': 'Failed to load',
  'documents.editor.backToList': 'Back to list',
  'documents.editor.backDocuments': '← Documents',
  'documents.editor.lastUpdated': 'Last updated',
  'documents.editor.titleLabel': 'Title',
  'documents.editor.saveTitle': 'Save title',
  'documents.editor.savingTitle': 'Saving…',
  'documents.editor.content': 'Content',
  'documents.editor.saveContent': 'Save content',
  'documents.editor.savingContent': 'Saving…',
  'documents.editor.autosaveSaving': 'Saving…',
  'documents.editor.autosaveSaved': 'All changes saved',
  'documents.editor.autosaveError': 'Could not save changes.',
  'documents.editor.autosaveHintTitle':
    'Title updates automatically after you stop typing (about half a second).',
  'documents.editor.contentPlaceholder': 'Write here…',
  'documents.editor.contentHint':
    'Content is sent to the server with the same delay while you type (PUT /documents/:id).',
  'documents.editor.visibilityLabel': 'Visibility',
  'documents.editor.readOnly': 'Read-only',
  'documents.editor.permissionLoading': 'Checking access…',
  'documents.editor.readOnlyHint':
    'You are not the owner of this document; title and content cannot be edited.',
  'documents.editor.readOnlyContentHint':
    'You are viewing the content; only the owner can make changes.',

  'roadmap.title': 'Roadmap',
  'roadmap.intro': 'What turns DevAtlas into a serious SaaS product.',
  'roadmap.richtext': 'Rich text editor',
  'roadmap.richtextSub': 'TipTap or Slate',
  'roadmap.autosave': 'Auto-save',
  'roadmap.autosaveSub': 'Debounce + API',
  'roadmap.versioning': 'Versioning',
  'roadmap.versioningSub': 'Document history',
  'roadmap.collab': 'Collaboration',
  'roadmap.collabSub': 'WebSocket / Nest gateway',

  'preferences.language': 'Language',
  'preferences.theme': 'Theme',
  'preferences.themeLight': 'Light',
  'preferences.themeDark': 'Dark',
  'preferences.themeSystem': 'System',

  'toast.titleSaved': 'Title saved.',
  'toast.contentSaved': 'Content saved.',
  'toast.documentCreated': 'Document created.',
  'validation.titleRequired': 'Title cannot be empty.',

  'errors.network': 'Network error: could not reach the API.',

  'editor.invalidLink': 'Invalid document link.',

  'meta.appTitle': 'DevAtlas',
  'meta.appDescription': 'DevAtlas application',
};
