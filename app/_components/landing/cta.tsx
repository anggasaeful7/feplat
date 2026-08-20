import Link from "next/link";
import { BrandMark } from "../brand-mark";

const checkList = [
  "Setup dalam 15 menit, tanpa tim IT",
  "Gratis selamanya untuk cluster kecil",
  "Dukungan penuh dari tim kami",
];

export function CTA() {
  return (
    <section className="py-24 bg-brand overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BrandMark size="md" />
              <span className="text-white font-semibold text-lg">IPLSistem</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Siap membawa transparansi ke cluster Anda?
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8">
              Bergabung dengan ratusan pengurus cluster yang sudah membuktikan
              IPLSistem — lebih transparan, lebih dipercaya, lebih efisien.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-brand text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
              >
                Mulai sekarang
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-white border border-white/30 text-sm font-medium px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                Jadwalkan demo
              </Link>
            </div>
          </div>

          {/* Right: checklist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-8 backdrop-blur-sm">
            <p className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">
              Sudah termasuk:
            </p>
            <div className="space-y-4">
              {checkList.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/85 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {["#4ade80", "#60a5fa", "#f97316"].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-brand/50 text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {["B", "R", "A"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">500+ pengurus</p>
                  <p className="text-white/60 text-xs">sudah bergabung bulan ini</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
