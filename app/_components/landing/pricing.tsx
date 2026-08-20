import Link from "next/link";

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "/ selamanya",
    desc: "Untuk cluster kecil yang baru memulai.",
    highlight: false,
    cta: "Mulai Gratis",
    ctaLink: "/login",
    features: [
      "Hingga 30 unit",
      "Tagihan manual",
      "Laporan keuangan dasar",
      "1 admin",
      "Dukungan komunitas",
    ],
    missingFeatures: [
      "Tagihan otomatis",
      "Booking fasilitas",
      "Multi-admin",
      "Export Excel & PDF",
    ],
  },
  {
    name: "Starter",
    price: "Rp 299.000",
    period: "/ bulan",
    desc: "Untuk cluster aktif yang ingin lebih efisien.",
    highlight: true,
    badge: "Paling Populer",
    cta: "Coba 14 Hari Gratis",
    ctaLink: "/login",
    features: [
      "Hingga 200 unit",
      "Tagihan otomatis (WhatsApp)",
      "Laporan keuangan lengkap",
      "Hingga 5 admin",
      "Booking fasilitas",
      "Export Excel & PDF",
      "Dukungan prioritas",
    ],
    missingFeatures: [
      "Multi-cluster",
      "API access",
    ],
  },
  {
    name: "Custom",
    price: "Hubungi Kami",
    period: "",
    desc: "Untuk PT pengelola dan cluster besar.",
    highlight: false,
    cta: "Hubungi Sales",
    ctaLink: "#",
    features: [
      "Unit tidak terbatas",
      "Multi-cluster",
      "Semua fitur Starter",
      "Admin tidak terbatas",
      "API access",
      "Onboarding khusus",
      "SLA & dukungan 24/7",
      "White-label tersedia",
    ],
    missingFeatures: [],
  },
];

export function Pricing() {
  return (
    <section id="harga" className="py-24 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Harga
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center leading-tight mb-4 max-w-xl mx-auto">
          Transparan, seperti laporan keuangan Anda.
        </h2>
        <p className="text-center text-muted text-base sm:text-lg max-w-lg mx-auto mb-14">
          Pilih paket yang sesuai kebutuhan cluster Anda. Tidak ada biaya
          tersembunyi, tidak ada kejutan.
        </p>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden ${
                plan.highlight
                  ? "bg-brand text-white shadow-2xl shadow-brand/30 scale-[1.02]"
                  : "bg-white border border-border shadow-sm"
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-white/20 border border-white/30 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-7">
                {/* Plan name & desc */}
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-white/70" : "text-muted"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-white/60" : "text-muted"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-white/70" : "text-muted"}`}>
                  {plan.desc}
                </p>

                {/* CTA */}
                <Link
                  href={plan.ctaLink}
                  className={`block text-center text-sm font-semibold px-5 py-3 rounded-full mb-6 transition-colors duration-150 ${
                    plan.highlight
                      ? "bg-white text-brand hover:bg-white/90"
                      : "bg-brand text-white hover:bg-brand-strong"
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlight ? "bg-white/20" : "bg-success-soft"
                      }`}>
                        <svg className={`w-2.5 h-2.5 ${plan.highlight ? "text-white" : "text-success"}`} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-sm ${plan.highlight ? "text-white/85" : "text-foreground"}`}>{f}</span>
                    </div>
                  ))}
                  {plan.missingFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 opacity-40">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlight ? "bg-white/10" : "bg-surface-muted"
                      }`}>
                        <svg className={`w-2.5 h-2.5 ${plan.highlight ? "text-white/50" : "text-muted"}`} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className={`text-sm line-through ${plan.highlight ? "text-white/50" : "text-muted"}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-muted text-sm mt-10">
          Semua harga belum termasuk PPN. Pembayaran tahunan hemat 20%.{" "}
          <Link href="#" className="text-brand hover:underline font-medium">
            Pelajari lebih lanjut →
          </Link>
        </p>
      </div>
    </section>
  );
}
