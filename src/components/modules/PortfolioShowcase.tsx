import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/atoms/Logo";
import { cn } from "@/lib/utils";

/**
 * Complete editorial presentation of the "FADÉ EXCLUSIVES — BRAND & GROWTH PORTFOLIO 2026" PDF.
 * Built with 100% solid luxury colors (Alabaster #F4F1EA, Obsidian #161412, Bronze #9E7344, Warm Stone #EAE4D8).
 */
export function PortfolioShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-0", className)}>
      {/* PAGE 01 / 08 COVER — BRAND & GROWTH PORTFOLIO 2026 */}
      <section className="bg-obsidian text-obsidian-foreground px-6 py-16 md:px-14 md:py-24 border-b border-border/20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between border-b border-obsidian-foreground/20 pb-8">
            <Logo variant="mark" markClassName="h-14 text-obsidian-foreground" />
            <div className="text-right text-[11px] font-medium uppercase tracking-[0.28em] text-obsidian-foreground/80">
              <p>BRAND &amp; GROWTH</p>
              <p>PORTFOLIO</p>
              <p className="mt-2 text-accent">2026</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-serif text-6xl font-normal tracking-[0.06em] sm:text-7xl md:text-8xl">
                FADÉ
              </h1>
              <p className="text-sm font-medium uppercase tracking-[0.42em] text-obsidian-foreground/90">
                E X C L U S I V E S
              </p>
              <div className="pt-2 font-serif text-xl italic leading-relaxed text-obsidian-foreground/90 sm:text-2xl">
                <p>African luxury.</p>
                <p>Contemporary expression.</p>
                <p>Commercial opportunity.</p>
              </div>
              <div className="h-px w-16 bg-accent" />
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/shop"
                  className="inline-flex min-h-[48px] items-center justify-center bg-accent px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground hover:opacity-90"
                >
                  Shop 2026 Collection
                </Link>
                <Link
                  href="/custom-fit"
                  className="inline-flex min-h-[48px] items-center justify-center border border-obsidian-foreground/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-obsidian-foreground hover:bg-obsidian-foreground hover:text-obsidian"
                >
                  Commission Custom Fit
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/5] w-full overflow-hidden border border-obsidian-foreground/20 bg-surface">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85"
                  alt="Fadé Exclusives Obsidian Noir Kaftan Editorial Cover"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-obsidian-foreground/20 pt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-obsidian-foreground/70">
            <div className="flex gap-6">
              <span>FASHION</span>
              <span>CULTURE</span>
              <span>IMPACT</span>
            </div>
            <div>AFRICAN LUXURY • FASHION HOUSE</div>
          </div>
        </div>
      </section>

      {/* PAGE 02 — THE DESIGNER & POINT OF VIEW */}
      <section className="bg-background text-foreground px-6 py-16 md:px-14 md:py-24 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between border-b border-border pb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span>02 — THE DESIGNER</span>
            <span>BRAND &amp; GROWTH PORTFOLIO</span>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-serif text-4xl font-normal uppercase tracking-wide sm:text-5xl">
                THE DESIGNER
              </h2>
              <p className="font-serif text-2xl italic leading-relaxed text-foreground/90">
                Fadé creates fashion at the intersection of African identity,
                contemporary design and modern luxury.
              </p>

              <div className="pt-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">
                  POINT OF VIEW
                </p>
                <div className="h-px w-12 bg-border" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  African fashion does not need to imitate global luxury to participate
                  in it.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Fadé&apos;s creative language draws from African visual culture while
                  translating it into silhouettes, materials and experiences relevant to
                  the contemporary luxury customer.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/4] overflow-hidden border border-border bg-obsidian">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                  alt="Fadé Creative Director in Espresso Kaftan and Striped Aso-Oke Fila"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-obsidian px-4 py-2 font-serif text-2xl italic text-obsidian-foreground">
                  Fadé
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pillars on Dark Obsidian Band */}
          <div className="mt-12 grid grid-cols-1 gap-8 bg-obsidian p-8 text-obsidian-foreground md:grid-cols-3 md:p-12">
            <div className="space-y-3 border-b border-obsidian-foreground/20 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                CREATIVE PHILOSOPHY
              </p>
              <p className="text-sm leading-relaxed text-obsidian-foreground/85">
                Fashion is more than clothing; it&apos;s a cultural expression, a form
                of storytelling and a vehicle for impact.
              </p>
            </div>
            <div className="space-y-3 border-b border-obsidian-foreground/20 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                DESIGN LANGUAGE
              </p>
              <p className="text-sm leading-relaxed text-obsidian-foreground/85">
                Bold silhouettes, rich textures, African references, refined details and
                a balance between tradition and modernity.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                COMMERCIAL DISTINCTIVENESS
              </p>
              <p className="text-sm leading-relaxed text-obsidian-foreground/85">
                A unique position in the market — culturally authentic, globally
                relevant, and designed for the modern luxury customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 03 — THE PRODUCT & THE FADÉ SIGNATURE */}
      <section className="bg-surface text-foreground px-6 py-16 md:px-14 md:py-24 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between border-b border-border pb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span>03 — THE PRODUCT</span>
            <span>TIMELESS PIECES. ENDLESS OCCASIONS.</span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-serif text-4xl font-normal uppercase sm:text-5xl">
                THE PRODUCT
              </h2>
              <p className="font-serif text-xl italic text-accent">
                Thoughtfully designed. Expertly crafted. Distinctively Fadé.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Each piece is a study in form, texture and cultural depth — crafted for
                the modern individual who values heritage, quality and timeless style.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  num: "01",
                  title: "SILHOUETTE",
                  desc: "Distinctive proportions and occasion-led construction.",
                },
                {
                  num: "02",
                  title: "MATERIAL",
                  desc: "Premium textiles selected for texture, movement and visual presence.",
                },
                {
                  num: "03",
                  title: "DETAIL",
                  desc: "Hand-finished elements that create recognition and elevate the overall look.",
                },
                {
                  num: "04",
                  title: "IDENTITY",
                  desc: "African references translated through a contemporary luxury lens.",
                },
              ].map((pillar) => (
                <div
                  key={pillar.num}
                  className="border border-border bg-surface-elevated p-4"
                >
                  <p className="font-serif text-lg font-semibold text-accent">
                    {pillar.num} —
                  </p>
                  <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* THE FADÉ SIGNATURE 5 ARCHETYPES */}
          <div className="mt-12 bg-obsidian p-8 text-obsidian-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-obsidian-foreground/20 pb-4">
              <h3 className="font-serif text-xl tracking-[0.14em] uppercase">
                THE FADÉ SIGNATURE
              </h3>
              <span className="text-[10px] uppercase tracking-[0.26em] text-accent">
                TIMELESS PIECES. ENDLESS OCCASIONS.
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { label: "THE AGBADA", href: "/shop?category=the-agbada" },
                { label: "THE MODERN SET", href: "/shop?category=the-modern-set" },
                { label: "THE FILA", href: "/shop?category=the-fila" },
                { label: "THE DETAIL", href: "/collections/signature-edit-2026" },
                { label: "THE SILHOUETTE", href: "/custom-fit" },
              ].map((sig) => (
                <Link
                  key={sig.label}
                  href={sig.href}
                  className="border border-obsidian-foreground/20 bg-obsidian p-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-obsidian-foreground hover:border-accent hover:text-accent"
                >
                  {sig.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 04 & 05 — CULTURAL ADVANTAGE & COMMUNITY PROOF */}
      <section className="bg-obsidian text-obsidian-foreground px-6 py-16 md:px-14 md:py-24 border-b border-obsidian-foreground/15">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              04 — THE MARKET
            </p>
            <h2 className="font-serif text-3xl font-normal uppercase leading-tight sm:text-4xl">
              A CULTURAL ADVANTAGE IN A GROWING LUXURY MARKET
            </h2>
            <div className="space-y-4 pt-2">
              {[
                {
                  title: "AFRICAN LUXURY",
                  desc: "Growing international interest in African designers and cultural expression.",
                },
                {
                  title: "DIASPORA",
                  desc: "A discerning global customer base seeking premium products that retain cultural relevance.",
                },
                {
                  title: "OCCASIONWEAR",
                  desc: "High-value purchases driven by weddings, milestone celebrations and social occasions.",
                },
                {
                  title: "GLOBAL CONTEMPORARY",
                  desc: "Opportunity to translate African design into a broader luxury fashion proposition.",
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className="border-l-2 border-accent pl-4 py-1"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em]">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-xs text-obsidian-foreground/80">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 border border-obsidian-foreground/20 p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              05 — EXISTING CUSTOMERS &amp; PROOF
            </p>
            <h3 className="font-serif text-3xl font-normal">
              People already want this.{" "}
              <span className="italic text-accent">Where&apos;s the evidence?</span>
            </h3>
            <p className="text-sm leading-relaxed text-obsidian-foreground/85">
              Fadé has built an engaged community around its distinctive approach to
              African occasionwear, with clients wearing the brand across weddings,
              diplomatic receptions, and cultural gatherings.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {[
                "CLIENT PHOTOS",
                "REPEAT ORDERS",
                "TESTIMONIALS",
                "EVENT APPEARANCES",
                "CULTURAL TASTEMAKERS",
                "EDITORIAL PRESS",
              ].map((proof) => (
                <div
                  key={proof}
                  className="border border-obsidian-foreground/20 px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em]"
                >
                  {proof}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 06 — PRODUCTION CAPABILITY (BUILT FOR QUALITY. READY TO SCALE.) */}
      <section className="bg-background text-foreground px-6 py-16 md:px-14 md:py-24 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between border-b border-border pb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span>06 — PRODUCTION CAPABILITY</span>
            <span>ABUJA IN-HOUSE ATELIER</span>
          </div>

          <div className="mt-8 max-w-2xl">
            <h2 className="font-serif text-4xl font-normal uppercase sm:text-5xl">
              BUILT FOR QUALITY.{" "}
              <span className="italic text-accent">READY TO SCALE.</span>
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              TRADITIONAL CRAFT. MODERN SYSTEMS. PRODUCTION THAT GROWS WITH DEMAND.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "ATELIER / MANUFACTURING",
                desc: "Skilled tailors and production teams, equipped with modern machines and dedicated workspace.",
              },
              {
                title: "PATTERN CUTTING",
                desc: "Precision cutting for consistent fit, architectural structure and clean finish.",
              },
              {
                title: "FABRICS",
                desc: "Premium African and international textiles carefully sourced for quality, texture and durability.",
              },
              {
                title: "DESIGN & DEVELOPMENT",
                desc: "Continuous refinement of silhouettes and new seasonal capsules based on client feedback.",
              },
              {
                title: "FINISHED GARMENTS",
                desc: "Each piece is individually inspected, steam-pressed and prepared for delivery.",
              },
              {
                title: "PRESENTATION PACKAGING",
                desc: "Secure, elegant and brand-consistent presentation boxes for a luxury unboxing experience.",
              },
              {
                title: "STUDIO & WORKSPACE",
                desc: "Dedicated Abuja studio for design, prototyping, private fittings and small-batch production.",
              },
              {
                title: "QUALITY CONTROL",
                desc: "Multi-stage checks for stitching tension, embroidery alignment, fit and finishing.",
              },
            ].map((cap) => (
              <div
                key={cap.title}
                className="border border-border bg-surface-elevated p-5"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  {cap.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGE 07 & 08 — GLOBAL GROWTH ROADMAP & WHY FADÉ / WHY NOW */}
      <section className="bg-surface text-foreground px-6 py-16 md:px-14 md:py-24">
        <div className="mx-auto max-w-6xl space-y-14">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
              07 — GTM &amp; GLOBAL ROADMAP
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal uppercase sm:text-5xl">
              FROM DESIGNER LABEL TO GLOBAL FASHION BUSINESS
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  step: "01",
                  title: "DIGITAL COMMERCE",
                  points: ["Direct-to-consumer flagship", "International shipping", "Bespoke concierge"],
                },
                {
                  step: "02",
                  title: "RETAIL",
                  points: ["Selective boutiques", "Luxury retailers", "Curated pop-ups"],
                },
                {
                  step: "03",
                  title: "ASIA / CHINA",
                  points: ["Strategic market entry", "Local partnerships", "Luxury distribution"],
                },
                {
                  step: "04",
                  title: "COLLABORATIONS",
                  points: ["Designers & artists", "Luxury houses", "Cultural institutions"],
                },
                {
                  step: "05",
                  title: "WHOLESALE",
                  points: ["Curated international stockists", "Seasonal showroom appointments"],
                },
              ].map((pillar) => (
                <div
                  key={pillar.step}
                  className="border border-border bg-surface-elevated p-5"
                >
                  <p className="font-serif text-3xl text-accent">{pillar.step}</p>
                  <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    {pillar.title}
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {pillar.points.map((pt) => (
                      <li key={pt}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-border pt-12 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-3xl uppercase">WHY FADÉ.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A distinctive African creative voice with the potential to become a
                globally relevant luxury proposition.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl uppercase">WHY NOW.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                African creativity is receiving unprecedented global attention. Consumers
                are increasingly seeking cultural authenticity, distinctive design and
                meaningful brand stories.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl uppercase">FADÉ EXCLUSIVES.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                African luxury. Contemporary expression. Commercial opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
