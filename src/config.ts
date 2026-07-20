const clean = (value: string | undefined) => value?.trim() ?? "";

export const SITE_CONFIG = {
  siteUrl: clean(import.meta.env.SITE_URL) || "https://qiuhai.net.cn",
  indexing: clean(import.meta.env.PUBLIC_INDEXING).toLowerCase() === "true",
  showProductPurchase: clean(import.meta.env.PUBLIC_SHOW_PRODUCT_PURCHASE).toLowerCase() === "true",
  filings: {
    icp: {
      number: clean(import.meta.env.ICP_NUMBER),
      url: clean(import.meta.env.ICP_URL),
    },
    publicSecurity: {
      number: clean(import.meta.env.PUBLIC_SECURITY_NUMBER),
      url: clean(import.meta.env.PUBLIC_SECURITY_URL),
    },
  },
} as const;
