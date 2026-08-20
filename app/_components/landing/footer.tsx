import Link from "next/link";
import { BrandMark } from "../brand-mark";

const footerLinks = {
  Fitur: [
    { label: "Laporan Keuangan", href: "#" },
    { label: "Tagihan Otomatis", href: "#" },
    { label: "Verifikasi Bayar", href: "#" },
    { label: "Booking Fasilitas", href: "#" },
    { label: "Multi-Cluster", href: "#" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Karir", href: "#" },
    { label: "Pers", href: "#" },
  ],
  "Sumber Daya": [
    { label: "Dokumentasi", href: "#" },
    { label: "Panduan Pengurus", href: "#" },
    { label: "Webinar", href: "#" },
    { label: "Status Layanan", href: "#" },
  ],
  Kontak: [
    { label: "Hubungi Sales", href: "#" },
    { label: "Dukungan", href: "#" },
    { label: "WhatsApp", href: "#" },
    { label: "hello@iplsistem.id", href: "mailto:hello@iplsistem.id" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-strong text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <BrandMark size="sm" />
              <span className="text-white font-semibold text-lg">IPLSistem</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              Platform pengelolaan cluster terpercaya untuk pengurus RT,
              bendahara, dan PT pengelola di seluruh Indonesia.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                {
                  label: "Twitter",
                  href: "#",
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "#",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  href: "#",
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/55 text-sm hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} IPLSistem. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-5">
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Cookie"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-white/40 text-xs hover:text-white/70 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
