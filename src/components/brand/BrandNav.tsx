import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/infinity/Wordmark";
import { CONTACT_MAILTO } from "@/lib/site";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "#platform", label: "Platform" },
  { href: "#holodock", label: "HoloDock" },
  { href: "#pillars", label: "Pillars" },
  { href: "#waitlist", label: "Waitlist" },
  { href: "#company", label: "Company" },
];

/**
 * The landing header from the brand mockup: wordmark left, plain links in the
 * middle, one gold pill on the right. `base` prefixes the anchors so the same
 * header works on routes other than the index.
 */
export function BrandNav({ base = "" }: { base?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-void/90 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="shell-brand flex h-[4.5rem] items-center justify-between gap-6">
        <a href={base || "#top"} aria-label="InfinityID Labs — home">
          <Wordmark markClassName="h-5 w-10" />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={`${base}${link.href}`}
              className="text-[0.8125rem] font-semibold text-white transition-colors hover:text-blue-light"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONTACT_MAILTO}
            className="hidden rounded-full bg-gold px-5 py-2.5 text-[0.8125rem] font-semibold text-void transition-colors hover:bg-gold-light sm:inline-flex"
          >
            Get in touch
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="brand-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex items-center justify-center rounded-[0.875rem] border border-graphite p-2.5 text-white md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <nav
        id="brand-mobile-nav"
        aria-label="Primary, mobile"
        hidden={!open}
        className="border-t border-graphite bg-void md:hidden"
      >
        <ul className="shell-brand flex flex-col py-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={`${base}${link.href}`}
                onClick={() => setOpen(false)}
                className="block border-b border-graphite py-4 text-sm font-semibold text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href={CONTACT_MAILTO} className="block py-4 text-sm font-semibold text-gold">
              Get in touch
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
