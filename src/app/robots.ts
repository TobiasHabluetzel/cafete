import type { MetadataRoute } from "next";

import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Cart and order confirmations are per-visitor and worthless in an index.
        disallow: ["/api/", "/de/warenkorb", "/en/cart", "/de/bestellung/", "/en/order/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
