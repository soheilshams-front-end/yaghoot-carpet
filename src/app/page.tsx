import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ColorFilterSection } from "@/components/home/ColorFilterSection";
import { FaqSection } from "@/components/home/FaqSection";
import { GuaranteesSection } from "@/components/home/GuaranteesSection";
import { NewestCarousel } from "@/components/home/NewestCarousel";
import { SectionDotsNav, type SectionDot } from "@/components/home/SectionDotsNav";
import { ShanehSection } from "@/components/home/ShanehSection";
import { SilkSection } from "@/components/home/SilkSection";
import { TopBand } from "@/components/home/TopBand";
import { FadeSection } from "@/components/FadeSection";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { RugCard } from "@/components/RugCard";
import { SaButton } from "@/components/SaButton";
import { SectionTitle } from "@/components/SectionTitle";
import { listProducts } from "@/lib/products";
import {
  getHomepageSections,
  getSiteSetting,
  listCategories,
} from "@/lib/cms";
import {
  colorFilters as defaultColors,
  faqs as defaultFaqs,
  guarantees as defaultGuarantees,
  heroImage,
  heroLabels,
} from "@/data/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rugs, sections, homeCats, heroSetting] = await Promise.all([
    listProducts(),
    getHomepageSections(true),
    listCategories({ homeOnly: true, activeOnly: true }),
    getSiteSetting("hero", {
      eyebrow: "تجربه‌ای متفاوت",
      headline: "به سبک فرش یاقوت",
    }),
  ]);

  const popular = rugs.slice(0, 4);
  const silk = rugs.filter((r) => r.collection === "silk");
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));

  const heroPayload = (byKey.hero?.payload ?? {}) as {
    image?: string;
    labels?: typeof heroLabels;
  };

  const shanehItems = (
    (byKey.shaneh?.payload as { items?: { shaneh: number; image: string; label?: string; hint?: string }[] })
      ?.items ?? undefined
  );

  const colorItems = (
    (byKey.colors?.payload as { items?: typeof defaultColors })?.items ?? defaultColors
  );

  const guaranteeItems = (
    (byKey.guarantees?.payload as { items?: typeof defaultGuarantees })?.items ??
    defaultGuarantees
  );

  const faqItems = (
    (byKey.faq?.payload as { items?: typeof defaultFaqs })?.items ?? defaultFaqs
  );

  const popularTitle =
    ((byKey.popular?.payload as { title?: string })?.title) ||
    "محبوب‌ترین فرش‌های ما";

  const showHero = !byKey.hero || byKey.hero.enabled;
  const showCategories = byKey.categories?.enabled !== false;
  const showNewest = byKey.newest?.enabled !== false;
  const showPopular = byKey.popular?.enabled !== false;
  const showShaneh = byKey.shaneh?.enabled !== false;
  const showColors = byKey.colors?.enabled !== false;
  const showSilk = byKey.silk?.enabled !== false;
  const showGuarantees = byKey.guarantees?.enabled !== false;
  const showFaq = byKey.faq?.enabled !== false;

  const navSections: SectionDot[] = [
    showHero && { id: "hero", label: "شروع" },
    showCategories && { id: "categories", label: "دسته‌ها" },
    showNewest && { id: "newest", label: "جدیدترین" },
    showPopular && { id: "popular", label: "محبوب‌ها" },
    showShaneh && { id: "shaneh", label: "شانه" },
    showColors && { id: "colors", label: "رنگ" },
    showSilk && { id: "silk", label: "ابریشم" },
    showGuarantees && { id: "guarantees", label: "چرا یاقوت" },
    showFaq && { id: "faq", label: "سوالات" },
  ].filter(Boolean) as SectionDot[];

  return (
    <>
      <SectionDotsNav sections={navSections} />

      {showHero && (
        <TopBand
          image={heroPayload.image || heroImage}
          labels={heroPayload.labels || heroLabels}
          eyebrow={heroSetting.eyebrow}
          headline={heroSetting.headline}
        />
      )}

      {showCategories && (
        <CategoryGrid
          categories={homeCats.map((c) => ({
            id: c.slug,
            title: c.title,
            image: c.image,
          }))}
        />
      )}

      {showNewest && <NewestCarousel rugs={rugs} />}

      {showPopular && (
        <FadeSection
          id="popular"
          tone="bone"
          motif="islimi"
          className="scroll-mt-20 px-4 py-[clamp(2.5rem,5vw,4rem)] sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between gap-2 sm:mb-8 sm:gap-4">
              <SectionTitle>{popularTitle}</SectionTitle>
              <SaButton href="/rugs" variant="solid">
                مشاهده بیشتر
              </SaButton>
            </div>
            <RevealGroup className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((rug) => (
                <RevealItem key={rug.id}>
                  <RugCard rug={rug} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </FadeSection>
      )}

      {showShaneh && <ShanehSection items={shanehItems} />}

      {showColors && <ColorFilterSection items={colorItems} />}

      {showSilk && <SilkSection rugs={silk} />}

      {showGuarantees && <GuaranteesSection items={guaranteeItems} />}

      {showFaq && <FaqSection items={faqItems} />}
    </>
  );
}
