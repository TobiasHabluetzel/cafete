import { LegalPage } from "@/components/legal/legal-page";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("legal", "terms.title");

export default async function Page({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  return <LegalPage locale={locale} namespace="terms" />;
}
