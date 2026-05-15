"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowNarrativesEn = exports.diagramNarrativesEn = void 0;
exports.diagramNarrativesEn = {
    'react-app-layer-architecture': `## Scenario: Saving a diagram

**Ayşe** edits a diagram in the editor and clicks **Save**. Follow the boxes in order.

1. **UI Components** — The Save button in \`DiagramEditor\` fires \`onSave\`; the form does not do a full submit.
2. **Custom Hooks** — \`useDiagramSave\` runs client validation, then calls the save function.
3. **Client Store** — The \`diagramDraft\` Zustand slice updates optimistically; the UI shows “Saving…”.
4. **API Client** — Sends \`PATCH /api/diagrams/{id}\` with \`Authorization\` and the node/edge JSON body.
5. **Backend API** — NestJS handles the request; Prisma persists to PostgreSQL and returns \`200 OK\` with \`updatedAt\`.
6. On success the hook syncs the store; **UI Components** shows a green toast.

> **Follow the diagram:** Arrows go UI → Hooks → Store/API → Backend; \`fetch\` and \`HTTP\` edges are the network hop.`,
    'request-lifecycle': `## Scenario: Loading the Explore document list

**Mehmet** opens \`/explore\` in the browser. While the list loads, the request follows this path:

1. **Browser** — The React app issues \`GET https://api.devatlas.local/explore/feed?page=1\` (SPA fetch).
2. **CDN** — Cached \`logo.svg\` and \`main.js\` may be served here; **API JSON** usually bypasses CDN (upper branch in the diagram).
3. **Load Balancer** — Routes to a healthy API pod.
4. **API Gateway** — TLS termination, JWT checks, rate limit; forwards to the inner service.
5. **Microservice** — \`ExploreService\` applies filters and maps to a DTO.
6. **PostgreSQL** — Runs \`SELECT ... FROM documents WHERE visibility = 'public' ORDER BY published_at DESC LIMIT 20\`; JSON returns to the browser.

> **Follow the diagram:** Start at **Browser**; the CDN branch is mostly static assets. The main API path is Browser → Load Balancer → API Gateway → Microservice → PostgreSQL.`,
    'authentication-flow': `## Scenario: First login and a protected page

**Zeynep** is not logged in yet; after login she opens the diagrams page.

1. **Client App** — Email/password on the login form; click **Sign in**.
2. **POST /auth/login** — Body \`{ "email": "...", "password": "..." }\`; server looks up the user and verifies bcrypt.
3. **Issue JWT + Refresh** — Issues access (15m) and refresh (7d); refresh is stored in an httpOnly cookie.
4. **Access Token** — Returned in the response body; client keeps it in memory or secure storage.
5. **Auth Guard** — On \`/diagrams\`, each \`GET /api/diagrams\` sends \`Authorization: Bearer <access>\`; invalid tokens get **401**.
6. **POST /auth/refresh** — When access expires, the client calls \`/auth/refresh\`; **Issue JWT + Refresh** mints a new access token without showing the login screen again.

> **Follow the diagram:** Login path Client → POST /auth/login → Issue → Access. Later calls go Access → Auth Guard. The \`expired\` edge is the refresh loop.`,
    'microservice-architecture': `## Scenario: Publishing a new document

**Can** clicks **Publish** in the editor. The request crosses service boundaries instead of staying monolithic.

1. **API Gateway** — \`POST /api/documents\` hits one entry point; routing picks the target from path + JWT.
2. **Documents Service** — Validates title/body, \`INSERT\` into the documents DB, returns **201**.
3. **Message Bus** — Documents publishes \`document.published\` asynchronously.
4. **Diagrams Service** — Consumes the event and updates search index or suggestion cache (not visible in the HTTP trace).
5. **Observability** — Spans from gateway → documents → consumer share one trace id.

> **Follow the diagram:** Solid arrows from the gateway are synchronous HTTP. Documents → Message Bus → Diagrams is the async side effect.`,
    'database-scaling': `## Scenario: Dashboard stats under heavy read load

**Elif** opens the “Last 7 days summary” card; the stack scales reads.

1. **Application** — Calls \`getWeeklyStats(userId)\`.
2. **Redis Cache** — Looks up \`stats:weekly:{userId}\`. On **cache hit**, PostgreSQL is skipped (~2 ms).
3. **Cache miss** — Read query goes through **PgBouncer** to the **Read Replica** (\`reads\` edge).
4. **Read Replica** — Runs the heavy \`SELECT\` + aggregates.
5. The app writes the result to Redis with a 60s TTL and returns JSON to Elif.
6. When she updates her avatar it is a **write**: **Application** → **PgBouncer** → **Primary DB** (\`writes\`); replicas catch up shortly after.

> **Follow the diagram:** Read path App → Redis shortcut or App → Pool → Replica. Writes always Pool → Primary.`,
    'cicd-deployment-flow': `## Scenario: Deploy after merging to main

**Deniz** merges an auth fix to \`main\`. The pipeline follows the diagram.

1. **Git Push** — \`git push origin main\` triggers the GitHub webhook.
2. **CI Pipeline** — Workflow runs checkout, \`npm ci\`, env setup.
3. **Tests + Lint** — \`npm test\` and \`npm run lint\` in parallel; a red job stops deploy.
4. **Docker Build** — On green, builds image \`api:1.4.2\` from the \`Dockerfile\`.
5. **Container Registry** — Pushes \`ghcr.io/org/api:1.4.2\` with signing/SBOM.
6. **Kubernetes Rollout** — Cluster pulls the image; rolling pods; traffic moves after health checks pass.

> **Follow the diagram:** Linear Git Push → K8s. Tests and Build branch from CI; deploy continues only when both succeed.`,
    'state-management-diagram': `## Scenario: Updating a display name

**Burak** changes his visible name in settings; see where each kind of state lives.

1. **React UI** — Each keystroke updates \`draftName\` in **useState / useReducer** (not sent yet).
2. **Blur or Save** — Fires \`useUpdateProfile\` (TanStack Query); button shows loading.
3. **TanStack Query** — Sends \`PUT /api/users/me\` to **REST API**; cache key \`['user','me']\` is \`pending\`.
4. **REST API** — Updates \`display_name\` in \`users\` and returns the row.
5. On success the query cache updates; **React UI** syncs the input.
6. **Zustand Store** — If the navbar name lives in \`authSlice\`, dispatch \`setDisplayName\` so the header updates without reload.

> **Follow the diagram:** Ephemeral typing stays local. Server-backed data flows UI → Query → REST API. Cross-page chrome uses the global store.`,
    'micro-frontend-architecture': `## Scenario: From documents to diagrams

**Selin** navigates between modules owned by different teams.

1. **Host Shell** — Opens \`https://app.devatlas.com\`; shared layout, auth, and React Router live here.
2. She clicks **Diagrams** in the sidebar; URL becomes \`/diagrams\`.
3. **Host Shell** — Lazy-loads the **Diagrams Remote** bundle via \`import('diagrams/Module')\` (short delay on first click).
4. **Nav Remote** — Already mounted; highlights the active tab.
5. **Diagrams Remote** — Renders list/editor; buttons import \`Button\` and \`Card\` from the **Design System**.
6. **Design System** — Shared tokens keep Documents and Diagrams visually consistent.

> **Follow the diagram:** Host on top; arrows to three remotes. Each remote also points at the shared design system.`,
};
exports.flowNarrativesEn = [
    {
        slug: 'full-stack-request-journey',
        narrative: `## Scenario: Opening a public document

**Ayşe** clicks the *"NestJS WebSocket Guide"* card on Explore. This flow splits that **one click** across **three diagrams**—same user story, deeper detail each time.

| Step | Diagram | What you learn |
|------|---------|----------------|
| 1 | HTTP Request Lifecycle | How the request crosses the network stack |
| 2 | Microservice Architecture | Which service the gateway routes to |
| 3 | Database Scaling | Where data is read and when cache helps |

Use the step list or **Next step**; each step shows scenario text under the diagram.`,
        steps: [
            {
                diagramSlug: 'request-lifecycle',
                label: 'Step 1 — Request enters the stack',
                narrative: `### Ayşe’s click (this diagram)

Clicking the card triggers \`GET /api/documents/nestjs-websocket-guide\`.

1. **Browser** — SPA route changes; fetch runs in parallel.
2. **CDN** — Page assets may be cached; the API call bypasses CDN.
3. **Load Balancer** — Request lands on e.g. \`api-pod-2\`.
4. **API Gateway** — JWT optional for public doc; rate-limit counter increments.
5. **Microservice** — Domain service not fixed yet; gateway will route internally (Step 2).
6. **PostgreSQL** — Diagram shows the last hop toward persistence; details in Step 3.

**Next:** how the gateway routes this to **Documents Service**.`,
            },
            {
                diagramSlug: 'microservice-architecture',
                label: 'Step 2 — Service routing',
                narrative: `### Same request — service boundary (this diagram)

The gateway inspects the path: \`/api/documents/...\` → **Documents Service**.

1. **API Gateway** — Proxies in one hop; the client never sees microservice URLs.
2. **Documents Service** — Runs \`findBySlug('nestjs-websocket-guide')\`; builds markdown + metadata.
3. Response is **200**, not 201 (read, not create).
4. (Side story) Another user publishing a diagram can fire **Diagrams Service** → **Message Bus**; Ayşe’s read is unaffected.
5. **Observability** — Trace shows \`gateway → documents\` ~40 ms.

**Next:** how Documents hits **replica and Redis**.`,
            },
            {
                diagramSlug: 'database-scaling',
                label: 'Step 3 — Data layer',
                narrative: `### Same request — reading data (this diagram)

Inside Documents Service the call walks this stack:

1. **Application** — \`DocumentRepository.findBySlug\`.
2. **Redis Cache** — Key \`doc:slug:nestjs-websocket-guide\`. First visit is a **miss**; filled after this path.
3. **PgBouncer** — Borrows a pooled connection.
4. **Read Replica** — \`SELECT * FROM documents WHERE slug = $1\` offloads read load from primary.
5. Result cached in Redis; JSON returns to the editor.

**Flow complete.** You can still open each diagram from the **Diagrams** tab.`,
            },
        ],
    },
    {
        slug: 'secure-delivery-pipeline',
        narrative: `## Scenario: Secure delivery

**Deniz** ships a fix for a production **401**. This flow uses **two diagrams**—not merged into one canvas.

| Order | Diagram | In real life |
|-------|---------|----------------|
| 1 | Authentication Flow | How users sign in with the new build |
| 2 | CI/CD Deployment Flow | How the fix reaches the server |

Validate identity first (Step 1), then watch the pipeline ship the image (Step 2).`,
        steps: [
            {
                diagramSlug: 'authentication-flow',
                label: 'Step 1 — Identity and tokens',
                narrative: `### Session before/after deploy (this diagram)

Deniz’s change touches **Auth Guard** logic. Staging walks this path first:

1. **Client App** — Test user logs in on staging.
2. **POST /auth/login** — Stricter validation; wrong password → **401**, success → tokens.
3. **Issue JWT + Refresh** — New claims (\`aud\`, \`iss\`) are set here.
4. **Access Token** — Stored by the SPA/mobile client.
5. **Auth Guard** — \`GET /api/diagrams\` rejects legacy token shapes; user hits **POST /auth/refresh**.
6. QA signs off → Step 2 deploy.

> No **Docker / K8s** in this diagram—identity only. Pipeline is the next diagram.`,
            },
            {
                diagramSlug: 'cicd-deployment-flow',
                label: 'Step 2 — Build and deploy',
                narrative: `### Same fix — production (this diagram)

Deniz merges to \`main\`; users receive the fix in this order:

1. **Git Push** — Webhook starts CI.
2. **CI Pipeline** — \`api\` workflow.
3. **Tests + Lint** — Auth unit tests must pass or deploy stops.
4. **Docker Build** — New \`api:1.4.3\` image.
5. **Container Registry** — Push succeeds.
6. **Kubernetes Rollout** — Pods roll; **Auth Guard** runs new code everywhere.

When Ayşe refreshes, expired access tokens rotate through refresh without another login screen.`,
            },
        ],
    },
    {
        slug: 'frontend-architecture-path',
        narrative: `## Scenario: Building the “My diagrams” filter

The **team** adds a list filter in the DevAtlas client. This flow shows the same feature at **three architecture levels**:

1. Layers and responsibilities (React App Layer)
2. Where state lives (State Management)
3. Splitting modules at scale (Micro Frontend)

Each step is a different diagram—read in order.`,
        steps: [
            {
                diagramSlug: 'react-app-layer-architecture',
                label: 'Step 1 — App layers',
                narrative: `### Where does the filter UI live? (this diagram)

1. **UI Components** — Add a “Mine only” switch to \`DiagramListToolbar\`.
2. **Custom Hooks** — \`useDiagramListFilters\` syncs with the URL (\`?mine=true\`).
3. **Client Store** — Preference survives the session in Zustand.
4. **API Client** — Calls \`GET /api/diagrams?owner=me\`.
5. **Backend API** — Returns the filtered list.

After this step the feature works; Step 2 checks state boundaries.`,
            },
            {
                diagramSlug: 'state-management-diagram',
                label: 'Step 2 — State boundaries',
                narrative: `### Same filter — state decisions (this diagram)

1. Toggle chrome → **useState** (toolbar only).
2. List payload → **TanStack Query** key \`['diagrams', { mine: true }]\`.
3. Navbar user name → **Zustand** (unrelated to the filter—do not mix).
4. **REST API** — Query talks via fetch; avoid redundant global writes.

Rule: server list data stays in Query; do not mirror everything in Zustand.`,
            },
            {
                diagramSlug: 'micro-frontend-architecture',
                label: 'Step 3 — Federated UI',
                narrative: `### Same feature — team boundaries (this diagram)

As the product grows, the Diagrams team ships on its own cadence:

1. **Host Shell** — Keeps auth/routing; defines \`/diagrams\`.
2. **Diagrams Remote** — Ships the filter toolbar weekly.
3. **Nav Remote** / **Docs Remote** — Unaffected; host only knows remote entry URLs.
4. **Design System** — Shared switch and list cards.

Ship as a federated module without redeploying the host for every Diagrams change.`,
            },
        ],
    },
];
//# sourceMappingURL=narratives-en.data.js.map