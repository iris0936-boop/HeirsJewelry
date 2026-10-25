import Link from "next/link";

const links = [
  { href: "/ring-builder", label: "Ring Builder" },
  { href: "/diamonds", label: "Diamonds" },
  { href: "/designs", label: "Designs" },
  { href: "/custom", label: "Custom" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif text-xl tracking-wide text-stone-900">
          Heir’s <span className="text-stone-400">Jewelry</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-stone-600 transition hover:text-stone-900">
              {l.label}
            </Link>
          ))}
          <Link
            href="/custom"
            className="rounded-full bg-accent px-4 py-2 font-medium text-stone-900 transition hover:bg-accent-hover"
          >
            Book a consult
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-stone-600 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-serif text-lg text-stone-900">Heir’s Jewelry</p>
          <p className="mt-2">Hand-selected diamonds and custom-designed pieces.</p>
        </div>
        <div>
          <p className="font-medium text-stone-900">Explore</p>
          <ul className="mt-2 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-stone-900">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-stone-900">Contact</p>
          <p className="mt-2">hello@example.com</p>
          <p>(555) 555-0123</p>
          <p>By appointment</p>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Heir’s Jewelry
      </p>
    </footer>
  );
}
