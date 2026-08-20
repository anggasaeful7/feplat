import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-brand overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          {/* Left content */}
          <div className="pb-20 lg:pb-24">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Platform 360° untuk pengelolaan cluster
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              Kelola iuran cluster
              <br />
              dengan{" "}
              <em className="text-white/80 font-bold">
                transparansi
              </em>
              <br />
              yang dipercaya.
            </h1>

            {/* Subtext */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-md mb-10">
              IPLSistem membantu pengurus cluster mengelola iuran, laporan keuangan,
              dan fasilitas — lebih transparan, lebih mudah, dan dipercaya semua
              penghuni.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-brand text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-150 shadow-lg shadow-black/20"
              >
                Mulai gratis sekarang
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>
              <Link
                href="#cara-kerja"
                className="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 transition-colors duration-150"
              >
                Lihat demo
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                </svg>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {["#4ade80", "#86efac", "#bbf7d0", "#a7f3d0"].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-brand flex items-center justify-center text-xs font-bold text-brand"
                    style={{ backgroundColor: color }}
                  >
                    {["BU", "RK", "PA", "TS"][i]}
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-sm">
                <span className="text-white font-semibold">500+</span> pengurus sudah
                bergabung
              </p>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="relative flex justify-center lg:justify-end items-end">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Phone frame */}
              <div className="relative w-70 sm:w-75">
                {/* Phone outer */}
                <div className="bg-[#0a3020] rounded-[36px] p-2.5 shadow-2xl shadow-black/50 ring-1 ring-white/10">
                  {/* Phone inner screen */}
                  <div className="bg-background rounded-[28px] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-brand px-5 pt-4 pb-2 flex items-center justify-between">
                      <span className="text-white/80 text-[10px] font-medium">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[3, 4, 5].map(h => (
                            <div key={h} className="w-0.5 bg-white/70 rounded-sm" style={{ height: h }} />
                          ))}
                        </div>
                        <svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                        </svg>
                        <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <rect x="2" y="7" width="18" height="11" rx="2" />
                          <path d="M22 11v3" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="bg-background px-4 pt-4 pb-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-muted">Beranda</p>
                          <p className="text-xs font-semibold text-foreground">Budi – A-12</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">B</span>
                        </div>
                      </div>

                      {/* Balance card */}
                      <div className="bg-brand rounded-2xl px-4 py-4 mb-4">
                        <p className="text-white/70 text-[9px] mb-1">Tagihan Bulan Ini</p>
                        <p className="text-white text-2xl font-bold tracking-tight">450.000</p>
                        <p className="text-white/60 text-[9px] mt-0.5">Jatuh tempo 10 Jun</p>
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 bg-white/20 text-white text-[9px] font-semibold py-1.5 rounded-lg">
                            Bayar Sekarang
                          </button>
                          <button className="flex-1 bg-white/10 text-white/80 text-[9px] py-1.5 rounded-lg border border-white/20">
                            Riwayat
                          </button>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { label: "Tagihan", icon: "📄" },
                          { label: "Fasilitas", icon: "🏊" },
                          { label: "Laporan", icon: "📊" },
                          { label: "Kontak", icon: "📞" },
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col items-center gap-1">
                            <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-base">
                              {item.icon}
                            </div>
                            <span className="text-[8px] text-muted text-center">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Recent transactions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-semibold text-foreground">Tagihan Terkini</p>
                          <p className="text-[8px] text-brand">Lihat Semua</p>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: "IPL Mei 2026", amount: "450.000", status: "Belum Bayar", color: "#fdecc8", textColor: "#92590a" },
                            { name: "IPL Apr 2026", amount: "450.000", status: "Lunas", color: "#dcfce7", textColor: "#166534" },
                          ].map((item) => (
                            <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border">
                              <div>
                                <p className="text-[9px] font-medium text-foreground">{item.name}</p>
                                <p className="text-[8px] text-muted">Rp {item.amount}</p>
                              </div>
                              <span
                                className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: item.color, color: item.textColor }}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -left-12 top-1/3 bg-white rounded-xl px-3 py-2 shadow-xl shadow-black/20 border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-success-soft flex items-center justify-center">
                      <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-foreground">Pembayaran</p>
                      <p className="text-[8px] text-muted">Dikonfirmasi otomatis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
