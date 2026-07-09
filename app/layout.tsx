import type { Metadata } from "next";
import { Rajdhani, Fira_Code } from "next/font/google";
import "augmented-ui/augmented-ui.min.css";
import "./globals.css";
import { content } from "@/lib/content";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jamal Bhola - Software Engineer",
  description:
    "Computer Engineering graduate from SDSU specializing in software and web development",
  openGraph: {
    title: "Jamal Bhola - Software Engineer",
    description:
      "Computer Engineering graduate from SDSU specializing in software and web development",
    type: "website",
  },
};

// Runs before paint: restores theme, decides whether the boot intro plays,
// respects prefers-reduced-motion. Kept inline to avoid any flash (spec §11).
const bootScript = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem('jb-theme');if(t)d.setAttribute('data-theme',t);
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm)d.setAttribute('data-motion','reduced');
if(!rm&&!sessionStorage.getItem('jb-booted'))d.setAttribute('data-booting','1');
if(localStorage.getItem('jb-fx')==='off')d.setAttribute('data-fx','off');
}catch(e){}})()`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: content.identity.name,
  jobTitle: content.identity.tagline,
  email: `mailto:${content.contact.email}`,
  alumniOf: content.identity.school,
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA" },
  sameAs: content.contact.links.map((l) => l.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body className={`${rajdhani.variable} ${firaCode.variable} antialiased`}>
        {/* Instant pre-hydration splash (first visit only): paints immediately so
            there is no black gap before the client boot sequence mounts. CSS shows
            it only while html[data-booting="1"]; the boot overlay (z-90) covers it
            once hydrated, and it hides the moment data-booting is cleared. */}
        <div className="boot-splash" aria-hidden="true">
          <div className="boot-splash__brand">JB-OS</div>
          <div className="boot-splash__bar" />
          <div className="boot-splash__label">Initializing kernel…</div>
        </div>
        {children}
      </body>
    </html>
  );
}
