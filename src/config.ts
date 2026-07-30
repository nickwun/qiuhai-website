const clean = (value: string | undefined) => value?.trim() ?? "";
const publicDefault = (value: string | undefined, fallback: string) =>
  value === undefined ? fallback : clean(value);

export const SITE_CONFIG = {
  siteUrl: clean(import.meta.env.SITE_URL) || "https://qiuhai.net.cn",
  indexing: clean(import.meta.env.PUBLIC_INDEXING).toLowerCase() === "true",
  showProductPurchase: clean(import.meta.env.PUBLIC_SHOW_PRODUCT_PURCHASE).toLowerCase() === "true",
  filings: {
    icp: {
      number: publicDefault(import.meta.env.ICP_NUMBER, "闽ICP备2026028446号-1"),
      url: publicDefault(import.meta.env.ICP_URL, "https://beian.miit.gov.cn/"),
    },
    publicSecurity: {
      number: clean(import.meta.env.PUBLIC_SECURITY_NUMBER),
      url: clean(import.meta.env.PUBLIC_SECURITY_URL),
    },
  },
} as const;
