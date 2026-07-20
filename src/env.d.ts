/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_INDEXING?: string;
  readonly ICP_NUMBER?: string;
  readonly ICP_URL?: string;
  readonly PUBLIC_SECURITY_NUMBER?: string;
  readonly PUBLIC_SECURITY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
