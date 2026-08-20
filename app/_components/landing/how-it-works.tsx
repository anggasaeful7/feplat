const steps = [
  {
    number: "01",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Setup 15 menit",
    desc: "Daftar dan konfigurasi cluster Anda dalam 15 menit. Tidak perlu tim IT, tidak perlu instalasi.",
    detail: "Isi data cluster → Undang pengurus → Siap",
  },
  {
    number: "02",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Pengaturan kolola",
    desc: "Tambahkan unit dan penghuni. Atur tagihan, jadwal, dan hak akses untuk setiap anggota cluster.",
    detail: "Input unit → Atur tagihan → Kirim undangan penghuni",
  },
  {
    number: "03",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Penghuni transparan",
    desc: "Penghuni mengunduh aplikasi dan langsung bisa melihat tagihan, laporan keuangan, dan booking fasilitas.",
    detail: "Penghuni download app → Bayar → Lihat laporan",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Cara Kerja
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center leading-tight mb-4 max-w-xl mx-auto">
          Dari daftar sampai transparan dalam hitungan minggu.
        </h2>
        <p className="text-center text-muted text-base sm:text-lg max-w-lg mx-auto mb-16">
          Proses onboarding yang mudah — tidak butuh pengetahuan teknis apapun.
        </p>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-border z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step number bubble */}
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-brand text-white flex flex-col items-center justify-center mb-6 shadow-lg shadow-brand/30">
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider leading-none">Step</span>
                  <span className="text-white text-2xl font-bold leading-none">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-4">
                  {step.icon}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 max-w-xs">{step.desc}</p>

                {/* Detail pill */}
                <div className="inline-flex items-center gap-1.5 bg-surface-muted border border-border text-muted text-xs px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
