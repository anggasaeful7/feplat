const testimonials = [
  {
    quote:
      "Dulu penghuni sering tanya laporan keuangan ke saya langsung. Sekarang mereka tinggal buka app sendiri. Kepercayaan meningkat drastis, dan saya juga lebih tenang.",
    name: "Budi Santoso",
    role: "Ketua RT",
    cluster: "Perumahan Griya Asri, Tangerang",
    avatar: "BS",
    color: "#4ade80",
    stars: 5,
  },
  {
    quote:
      "Sebagai bendahara, saya tidak perlu lagi rekap manual tiap bulan. Semua tagihan keluar otomatis, dan bukti bayar langsung masuk ke sistem. Hemat waktu banget.",
    name: "Ratna Kusuma",
    role: "Bendahara RT",
    cluster: "Cluster Emerald, Bekasi",
    avatar: "RK",
    color: "#60a5fa",
    stars: 5,
  },
  {
    quote:
      "Kami mengelola 5 cluster sekaligus. Dengan IPLSistem, semuanya bisa dipantau dari satu dashboard. Laporan ke pemilik developer jadi jauh lebih profesional.",
    name: "Andi Pratama",
    role: "Direktur Operasional",
    cluster: "PT Graha Properti Mandiri",
    avatar: "AP",
    color: "#f97316",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 bg-warning-soft text-warning text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Testimonial
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center leading-tight mb-4 max-w-2xl mx-auto">
          Dipercaya pengurus RT, bendahara, dan PT pengelola di seluruh Indonesia.
        </h2>
        <p className="text-center text-muted text-base sm:text-lg max-w-lg mx-auto mb-14">
          Lihat apa yang mereka katakan setelah menggunakan IPLSistem.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-foreground leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                  <p className="text-xs text-brand font-medium">{t.cluster}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
