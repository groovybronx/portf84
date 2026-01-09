# 🎨 DIAGRAMMES D'ARCHITECTURE - LUMINA PORTFOLIO

## 📊 **Diagramme 1: Vue d'Ensemble du Système**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LUMINA PORTFOLIO SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   USER INTERFACE│    │   BUSINESS LOGIC│    │   DATA LAYER    │        │
│  │                 │    │                 │    │                 │        │
│  │ • React Components│◄──►│ • Custom Hooks │◄──►│ • SQLite DB     │        │
│  │ • Framer Motion │    │ • Services      │    │ • File System   │        │
│  │ • Tailwind CSS  │    │ • Context API   │    │ • Gemini API     │        │
│  │ • i18next       │    │ • State Mgmt    │    │ • Tauri Backend  │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │              │
│           └───────────────────────┼───────────────────────┘              │
│                                   ▼                                      │
│                    ┌─────────────────────────┐                              │
│                    │   TAURI DESKTOP APP    │                              │
│                    │                         │                              │
│                    │ • Native File Access   │                              │
│                    │ • System Integration   │                              │
│                    │ • Security & Sandboxing │                              │
│                    └─────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ **Diagramme 2: Architecture des Features**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FEATURE ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                              APP.TSX                                  │  │
│  │                        (Orchestration Layer)                          │  │
│  └─────────────────┬───────────────────────┬─────────────────────────────┘  │
│                    │                       │                               │
│        ┌───────────▼───────────┐ ┌─────────▼───────────┐                     │
│        │      LAYOUTS         │ │     OVERLAYS        │                     │
│        │                       │ │                     │                     │
│        │ • AppLayout          │ │ • ImageViewer       │                     │
│        │ • MainLayout         │ │ • ContextMenu       │                     │
│        │ • TopBar             │ │ • DragSelection     │                     │
│        │ • FolderDrawer       │ │ • Modals            │                     │
│        └───────────┬───────────┘ └─────────┬───────────┘                     │
│                    │                       │                               │
│        ┌───────────▼───────────────────────▼───────────┐                     │
│        │                    FEATURES                   │                     │
│        │                                               │                     │
│        │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│                     │
│        │ │   LIBRARY   │ │    TAGS     │ │   VISION    ││                     │
│        │ │             │ │             │ │             ││                     │
│        │ │ • PhotoGrid │ │ • TagHub    │ │ • ImageViewer││                     │
│        │ │ • PhotoCard │ │ • TagPanel  │ │ • Analysis  ││                     │
│        │ │ • Carousel  │ │ • Fusion    │ │ • Metadata  ││                     │
│        │ └─────────────┘ └─────────────┘ └─────────────┘│                     │
│        └─────────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Diagramme 3: Flux de Données**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER ACTION                                                                │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   COMPONENT     │───►│  CUSTOM HOOK   │───►│   SERVICE       │        │
│  │                 │    │                 │    │                 │        │
│  │ • onClick       │    │ • usePhotoGrid │    │ • storageService│        │
│  │ • onHover       │    │ • useAppHandlers│   │ • geminiService │        │
│  │ • onDrag        │    │ • useSelection │    │ • libraryLoader │        │
│  │ • onScroll      │    │ • useModalState │    │ • secureStorage │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │              │
│           ▼                       ▼                       ▼              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  CONTEXT UPDATE │    │   TAURI CALL    │    │   DATABASE      │        │
│  │                 │    │                 │    │                 │        │
│  │ • setState      │    │ • invoke()      │    │ • SQLite        │        │
│  │ • dispatch      │    │ • fs commands   │    │ • File System   │        │
│  │ • notify        │    │ • dialog        │    │ • API calls     │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│           │                       │                       │              │
│           └───────────────────────┼───────────────────────┘              │
│                                   ▼                                      │
│                    ┌─────────────────────────┐                              │
│  RE-RENDER ◄────────│   STATE PROPAGATION    │◄───────── DATA RETURN     │
│                    └─────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 **Diagramme 4: Communication des Composants**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT COMMUNICATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        APP CONTEXT                                   │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                          │  │
│  │  │   APP STATE     │    │  APP DISPATCH   │                          │  │
│  │  │                 │    │                 │                          │  │
│  │  │ • selectedItems │    │ • setSelected    │                          │  │
│  │  │ • activeFolder  │    │ • toggleModal    │                          │  │
│  │  │ • tags          │    │ • updateTags     │                          │  │
│  │  │ • UI states     │    │ • navigate       │                          │  │
│  │  └─────────────────┘    └─────────────────┘                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│              │                                     │                       │
│              ▼                                     ▼                       │
│  ┌─────────────────┐                    ┌─────────────────┐              │
│  │   PARENT        │                    │   CHILD          │              │
│  │   COMPONENTS    │                    │   COMPONENTS     │              │
│  │                 │                    │                 │              │
│  │ • App.tsx       │───PROPS──────────►│ • PhotoGrid     │              │
│  │ • Layouts       │                   │ • PhotoCard     │              │
│  │ • Features      │                   │ • Modals        │              │
│  └─────────────────┘◄──CALLBACKS───────└─────────────────┘              │
│              │                                     │                       │
│              ▼                                     ▼                       │
│  ┌─────────────────┐                    ┌─────────────────┐              │
│  │   CUSTOM HOOKS  │                    │   SERVICES      │              │
│  │                 │                    │                 │              │
│  │ • useAppContext │◄──CONTEXT───────►│ • storage       │              │
│  │ • useHandlers   │                   │ • gemini        │              │
│  │ • useModalState │                   │ • library       │              │
│  └─────────────────┘                    └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Diagramme 5: Architecture des Services**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICES ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        SERVICE LAYER                                 │  │
│  └─────────────────┬───────────────────────┬─────────────────────────────┘  │
│                    │                       │                               │
│        ┌───────────▼───────────┐ ┌─────────▼───────────┐                     │
│        │   STORAGE SERVICE     │ │   GEMINI SERVICE   │                     │
│        │                       │ │                     │                     │
│        │ • SQLite CRUD         │ │ • Image Analysis   │                     │
│        │ • Transactions        │ │ • Tag Generation    │                     │
│        │ • Prepared Statements │ │ • Error Handling    │                     │
│        │ • Cache Management    │ │ • Rate Limiting     │                     │
│        └───────────┬───────────┘ └─────────┬───────────┘                     │
│                    │                       │                               │
│        ┌───────────▼───────────────────────▼───────────┐                     │
│        │              LIBRARY LOADER SERVICE           │                     │
│        │                                               │                     │
│        │ • File System Operations                      │                     │
│        │ • Image Loading & Thumbnails                  │                     │
│        │ • Folder Scanning                             │                     │
│        │ • Asset Protocol Optimization                 │                     │
│        │ • Metadata Extraction                        │                     │
│        └───────────────────────────────────────────────┘                     │
│                                   │                                       │
│                                   ▼                                       │
│        ┌───────────────────────────────────────────────┐                     │
│        │              TAURI BACKEND LAYER              │                     │
│        │                                               │                     │
│        │ • Rust Commands (safe & fast)                │                     │
│        │ • File System Access (permissions)            │                     │
│        │ • Database Operations (SQLite)                │                     │
│        │ • HTTP Requests (Gemini API)                 │                     │
│        │ • Security & Sandboxing                        │                     │
│        └───────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Diagramme 6: Architecture UI/UX**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UI/UX ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        DESIGN SYSTEM                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   TOKENS       │    │   COMPONENTS    │    │   PATTERNS      │    │  │
│  │  │                 │    │                 │    │                 │    │  │
│  │  │ • Colors       │    │ • Button        │    │ • Compound      │    │  │
│  │  │ • Spacing      │    │ • Modal         │    │ • Render Props  │    │  │
│  │  │ • Typography   │    │ • Input         │    │ • Custom Hooks  │    │  │
│  │  │ • Effects      │    │ • Card          │    │ • Context       │    │  │
│  │  │ • Animations   │    │ • Skeleton      │    │ • Provider      │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│              │                       │                       │              │
│              ▼                       ▼                       ▼              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   TAILWIND      │    │   FRAMER MOTION │    │   LUCIDE REACT │        │
│  │                 │    │                 │    │                 │        │
│  │ • Utility Classes│    │ • Animations    │    │ • Icon Library  │        │
│  │ • Responsive    │    │ • Gestures      │    │ • Consistent    │        │
│  │ • Dark Mode     │    │ • Layout Anim   │    │ • Optimized     │        │
│  │ • Custom Config │    │ • Spring Physics│    │ • Tree Shakeable│        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│              │                       │                       │              │
│              └───────────────────────┼───────────────────────┘              │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        USER EXPERIENCE                             │  │
│  │                                                                   │  │
│  │ • Glass Morphism Design                                            │  │
│  │ • Smooth Transitions (0.15s - 0.3s)                               │  │
│  │ • GPU Accelerated Animations                                      │  │
│  │ • Loading States (Skeleton)                                        │  │
│  │ • Responsive Design (Mobile-First)                                │  │
│  │ • Accessibility (ARIA, Keyboard)                                   │  │
│  │ • Internationalization (i18next)                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 **Diagramme 7: Architecture de Test**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        TESTING PYRAMID                               │  │
│  │                                                                   │  │
│  │     ┌─────────────────────────────────────────┐                   │  │
│  │     │           E2E TESTS (Future)            │                   │  │
│  │     │  • User workflows                       │                   │  │
│  │     │  • Cross-browser compatibility           │                   │  │
│  │     │  • Performance testing                  │                   │  │
│  │     └─────────────────────────────────────────┘                   │  │
│  │                │                                       │          │  │
│  │                ▼                                       ▼          │  │
│  │     ┌─────────────────────────────────────────┐                   │  │
│  │     │        INTEGRATION TESTS                 │                   │  │
│  │     │  • Component interactions                 │                   │  │
│  │     │  • Feature workflows                    │                   │  │
│  │     │  • Service integration                  │                   │  │
│  │     └─────────────────────────────────────────┘                   │  │
│  │                │                                       │          │  │
│  │                ▼                                       ▼          │  │
│  │     ┌─────────────────────────────────────────┐                   │  │
│  │     │          UNIT TESTS                      │                   │  │
│  │     │  • Component logic                       │                   │  │
│  │     │  • Custom hooks                         │                   │  │
│  │     │  • Service functions                    │                   │  │
│  │     │  • Utility functions                    │                   │  │
│  │     └─────────────────────────────────────────┘                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│              │                       │                       │              │
│              ▼                       ▼                       ▼              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │     VITEST     │    │ REACT TESTING   │    │   MOCKS &      │        │
│  │                 │    │     LIBRARY     │    │   FIXTURES     │        │
│  │ • Fast Runner   │    │                 │    │                 │        │
│  │ • TypeScript    │    │ • RTL Queries   │    │ • Tauri Mocks   │        │
│  │ • Watch Mode    │    │ • User Events   │    │ • Service Mocks │        │
│  │ • Coverage      │    │ • Accessibility │    │ • Test Utils    │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Diagramme 8: Architecture de Build**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BUILD ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        DEVELOPMENT WORKFLOW                           │  │
│  │                                                                   │  │
│  │  npm run tauri:dev                                                  │  │
│  │       │                                                             │  │
│  │       ▼                                                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                        │  │
│  │  │   VITE DEV      │    │  TAURI DEV      │                        │  │
│  │  │                 │    │                 │                        │  │
│  │  │ • HMR           │◄──►│ • Hot Reload    │                        │  │
│  │  │ • Fast Refresh  │    │ • Dev Tools     │                        │  │
│  │  │ • Source Maps   │    │ • Console       │                        │  │
│  │  │ • TypeScript    │    │ • File Watcher  │                        │  │
│  │  └─────────────────┘    └─────────────────┘                        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│              │                       │                                      │
│              ▼                       ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        PRODUCTION BUILD                              │  │
│  │                                                                   │  │
│  │  npm run build                                                     │  │
│  │       │                                                             │  │
│  │       ▼                                                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   TYPESCRIPT    │    │     VITE        │    │   OPTIMIZATION  │    │  │
│  │  │                 │    │                 │    │                 │    │  │
│  │  │ • Compilation   │───►│ • Bundling      │───►│ • Minification  │    │  │
│  │  │ • Type Check    │    │ • Tree Shaking  │    │ • Compression   │    │  │
│  │  │ • Declarations  │    │ • Code Split    │    │ • Asset Opt     │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  │              │                       │                       │        │  │
│  │              ▼                       ▼                       ▼        │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   DIST/         │    │   TAURI BUILD   │    │   RELEASE       │    │  │
│  │  │                 │    │                 │    │                 │    │  │
│  │  │ • index.html    │───►│ • Rust Compile  │───►│ • .app/.exe     │    │  │
│  │  │ • assets/       │    │ • Bundle        │    │ • Installer     │    │  │
│  │  │ • .js files     │    │ • Resources     │    │ • Code Signature │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Diagramme 9: Patterns de Communication**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMMUNICATION PATTERNS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    PATTERN 1: PROPS DRILLING                         │  │
│  │                                                                   │  │
│  │  App.tsx ──► Layout.tsx ──► Feature.tsx ──► Component.tsx           │  │
│  │    │           │            │              │                        │  │
│  │    ▼           ▼            ▼              ▼                        │  │
│  │  Props      Props       Props         Props                      │  │
│  │  Data       Data        Data          Data                       │  │
│  │  Callbacks  Callbacks   Callbacks     Callbacks                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    PATTERN 2: CONTEXT API                            │  │
│  │                                                                   │  │
│  │  AppContext.Provider                                               │  │
│  │       │                                                             │  │
│  │       ▼                                                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                        │  │
│  │  │   STATE CONTEXT │    │  DISPATCH CTX   │                        │  │
│  │  │                 │    │                 │                        │  │
│  │  │ • selectedItems │    │ • setSelected    │                        │  │
│  │  │ • activeFolder  │    │ • toggleModal    │                        │  │
│  │  │ • tags          │    │ • updateTags     │                        │  │
│  │  └─────────────────┘    └─────────────────┘                        │  │
│  │           │                       │                                 │  │
│  │           └───────────┬───────────┘                                 │  │
│  │                       ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                  ANY COMPONENT                               │    │  │
│  │  │  useContext(AppState) │ useContext(AppDispatch)              │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    PATTERN 3: CUSTOM HOOKS                           │  │
│  │                                                                   │  │
│  │  Component                                                         │  │
│  │     │                                                             │  │
│  │     ▼                                                             │  │
│  │  useCustomHook()                                                   │  │
│  │     │                                                             │  │
│  │     ▼                                                             │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                        │  │
│  │  │   LOGIC         │    │   STATE         │                        │  │
│  │  │                 │    │                 │                        │  │
│  │  │ • Calculations  │    │ • useState      │                        │  │
│  │  │ • Side Effects  │    │ • useEffect     │                        │  │
│  │  │ • Validation    │    │ • useMemo        │                        │  │
│  │  │ • API Calls     │    │ • useCallback    │                        │  │
│  │  └─────────────────┘    └─────────────────┘                        │  │
│  │           │                       │                                 │  │
│  │           └───────────┬───────────┘                                 │  │
│  │                       ▼                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                  RETURN VALUES                              │    │  │
│  │  │  [state, handlers, loading, error]                        │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Diagramme 10: Architecture de Sécurité**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        SECURITY LAYERS                              │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                    FRONTEND SECURITY                        │    │  │
│  │  │                                                             │    │  │
│  │  │ • Input Validation (TypeScript)                             │    │  │
│  │  │ • XSS Prevention (React auto-escape)                        │    │  │
│  │  │ • CSP Headers (Content Security Policy)                     │    │  │
│  │  │ • API Key Storage (Secure Storage)                         │    │  │
│  │  │ • File Type Validation                                      │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  │              │                                                        │  │
│  │              ▼                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                    TAURI SECURITY                          │    │  │
│  │  │                                                             │    │  │
│  │  │ • Sandboxing (Isolated process)                            │    │  │
│  │  │ • Capability System (Permissions)                          │    │  │
│  │  │ • File System Access (Scoped)                              │    │  │
│  │  │ • Network Requests (Allowed origins)                       │    │  │
│  │  │ • Native API Access (Controlled)                            │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  │              │                                                        │  │
│  │              ▼                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                    DATA SECURITY                            │    │  │
│  │  │                                                             │    │  │
│  │  │ • SQLite Database (Local, encrypted)                       │    │  │
│  │  │ • API Keys (Secure storage, not in code)                   │    │  │
│  │  │ • File Paths (Validation, sandboxing)                       │    │  │
│  │  │ • User Data (Local only, no cloud)                          │    │  │
│  │  │ • Error Handling (No sensitive info in logs)               │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      SECURITY BEST PRACTICES                         │  │
│  │                                                                   │  │
│  │  🔒 Never hardcode API keys                                        │  │
│  │  🔒 Validate all user inputs                                       │  │
│  │  🔒 Use prepared statements for SQL                                 │  │
│  │  🔒 Implement proper error handling                                 │  │
│  │  🔒 Follow principle of least privilege                            │  │
│  │  🔒 Regular security audits                                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Conclusion des Diagrammes**

Ces diagrammes illustrent une architecture moderne, scalable et sécurisée :

### 🏗️ **Points Forts Architecturaux**

- **Feature-based**: Organisation claire et maintenable
- **Performance**: GPU acceleration et virtualisation
- **Sécurité**: Multi-couches de protection
- **Testabilité**: Pyramide de tests complète
- **UX**: Design system cohérent et animations fluides

### 🔄 **Patterns Éprouvés**

- **Context API** pour état global
- **Custom Hooks** pour logique réutilisable
- **Service Layer** pour accès aux données
- **Component Composition** pour flexibilité

Cette architecture supporte efficacement les objectifs actuels et futurs de Lumina Portfolio tout en maintenant une excellente expérience développeur et utilisateur.
