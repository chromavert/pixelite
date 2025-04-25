declare global {
  interface Window {
    __VITE_SSR?: boolean;
  }

  interface ImportMetaEnv {
    SSR?: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
