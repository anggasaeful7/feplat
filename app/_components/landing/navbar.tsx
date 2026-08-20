"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "../brand-mark";

const navLinks = [
  { label: "Fitur", href: "#fitur" },
  { label: "Transparansi", href: "#transparansi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Harga", href: "#harga" },
  { label: "Blog", href: "#blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <BrandMark size="sm" />
            <span className="font-semibold text-foreground text-[17px] tracking-tight">
              IPLSistem
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-brand transition-colors duration-150 px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-brand-strong transition-colors duration-150 shadow-sm"
            >
              Mulai Gratis
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                className="block px-3 py-2.5 text-sm font-medium text-foreground text-center border border-border rounded-full"
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2.5 text-sm font-semibold text-white text-center bg-brand rounded-full"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
