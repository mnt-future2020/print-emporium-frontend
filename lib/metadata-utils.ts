import { Metadata } from "next";
import { getSEOSettingsByPage } from "./seo-api";

/**
 * Generates Next.js Metadata for a specific page by fetching settings from the API.
 * This function should be used in generateMetadata() of public pages.
 */
export async function constructMetadata(pageName: string): Promise<Metadata> {
  try {
    const response = await getSEOSettingsByPage(pageName);

    // Return empty metadata if no SEO settings found
    if (!response.success || !response.data) {
      return {};
    }

    const { metaTitle, metaDescription, keywords, ogImage } = response.data;

    return {
      title: metaTitle || undefined,
      description: metaDescription || undefined,
      keywords: keywords || undefined,
      openGraph: {
        title: metaTitle || undefined,
        description: metaDescription || undefined,
        images: ogImage ? [{ url: ogImage }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle || undefined,
        description: metaDescription || undefined,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error(`Error constructing metadata for ${pageName}:`, error);
    return {};
  }
}
