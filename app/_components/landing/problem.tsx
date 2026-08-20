const withoutPoints = [
  "Penghuni tanya ke mana uang iuran dipakai",
  "Laporan keuangan dibuat manual, rawan manipulasi",
  "Tagihan tidak terkirim tepat waktu",
  "Bukti bayar hilang atau tidak tercatat",
  "Konflik antara pengurus dan penghuni",
];

const withPoints = [
  "Laporan keuangan terbuka & bisa dilihat semua penghuni",
  "Tagihan otomatis terkirim via WhatsApp & notifikasi",
  "Bukti bayar terverifikasi otomatis oleh sistem",
  "Histori transaksi lengkap dan bisa diaudit",
  "Kepercayaan penghuni meningkat drastis",
];

export function Problem() {
  return (
    <section id="transparansi" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 bg-danger-soft text-danger text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Masalah Nyata
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center leading-tight mb-4 max-w-xl mx-auto">
          Pengurus yang jujur sering dikira tidak jujur.
        </h2>
        <p className="text-center text-muted text-base sm:text-lg max-w-lg mx-auto mb-14">
          Tanpa sistem yang transparan, pengelolaan iuran selalu rawan pertanyaan
          — meski pengurus sudah bekerja sepenuh hati.
        </p>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Without card */}
          <div className="rounded-2xl overflow-hidden border border-danger/20 shadow-sm">
            <div className="bg-danger px-6 py-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">Tanpa IPLSistem</span>
            </div>
            <div className="bg-white px-6 py-5 space-y-3.5">
              {withoutPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-danger-soft flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-danger" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* With card */}
          <div className="rounded-2xl overflow-hidden border border-brand/20 shadow-sm">
            <div className="bg-brand px-6 py-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">Dengan IPLSistem</span>
            </div>
            <div className="bg-white px-6 py-5 space-y-3.5">
              {withPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
