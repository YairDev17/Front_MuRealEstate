/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend. Vacía = se usan los mocks locales. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
