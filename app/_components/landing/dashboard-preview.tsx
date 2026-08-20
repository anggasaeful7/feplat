export function DashboardPreview() {
  return (
    <section className="py-24 bg-brand overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Dashboard Keuangan
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              Lihat kesehatan keuangan cluster dalam 1 halaman.
            </h2>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8">
              Semua data keuangan cluster tersaji dalam satu dashboard yang mudah
              dibaca. Dari saldo kas, tagihan belum bayar, hingga tren pemasukan —
              semuanya real-time.
            </p>

            <ul className="space-y-3">
              {[
                "Saldo kas cluster selalu up-to-date",
                "Ringkasan tagihan & pembayaran per bulan",
                "Grafik tren pemasukan dan pengeluaran",
                "Export laporan ke PDF & Excel",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 shadow-2xl shadow-black/30">
              {/* Mockup header */}
              <div className="bg-[#0a3020] rounded-xl px-5 py-4">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>

                {/* Dashboard layout */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Sidebar */}
                  <div className="col-span-1 space-y-2">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-5 h-5 rounded-full bg-brand-soft/20" />
                      <div className="h-2 w-12 bg-white/20 rounded" />
                    </div>
                    {["Dashboard", "Tagihan", "Pembayaran", "Laporan", "Fasilitas"].map((item, i) => (
                      <div
                        key={item}
                        className={`px-2.5 py-2 rounded-lg text-[10px] font-medium ${
                          i === 0
                            ? "bg-white/20 text-white"
                            : "text-white/50 hover:text-white/70"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="col-span-3 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="h-2 w-16 bg-white/20 rounded mb-1.5" />
                        <div className="h-3 w-24 bg-white/40 rounded font-semibold" />
                      </div>
                      <div className="h-7 w-20 bg-white/10 rounded-lg border border-white/10" />
                    </div>

                    {/* Balance card */}
                    <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                      <p className="text-white/50 text-[9px] mb-1">Saldo Kas Cluster</p>
                      <p className="text-white text-xl font-bold mb-2">Rp 12.450.000</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-lg px-2 py-1.5">
                          <p className="text-white/40 text-[8px]">Pemasukan Bulan Ini</p>
                          <p className="text-green-400 text-[10px] font-semibold">+Rp 8.100.000</p>
                        </div>
                        <div className="bg-white/5 rounded-lg px-2 py-1.5">
                          <p className="text-white/40 text-[8px]">Pengeluaran</p>
                          <p className="text-red-400 text-[10px] font-semibold">-Rp 3.200.000</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Belum Bayar", value: "12", color: "text-yellow-400" },
                        { label: "Sudah Bayar", value: "83", color: "text-green-400" },
                        { label: "Total Unit", value: "98", color: "text-white" },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/5 rounded-lg px-2 py-2 border border-white/10">
                          <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-white/40 text-[8px]">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="bg-white/5 rounded-xl px-3 py-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-2 w-20 bg-white/20 rounded" />
                        <div className="h-2 w-12 bg-white/10 rounded" />
                      </div>
                      {/* Fake bar chart */}
                      <div className="flex items-end gap-1.5 h-10">
                        {[60, 80, 50, 90, 70, 85, 65, 95, 75, 88, 72, 92].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-white/20 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent payments table */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div className="px-3 py-2 border-b border-white/10">
                        <div className="h-2 w-28 bg-white/20 rounded" />
                      </div>
                      {[
                        { name: "Unit A-12 · Budi S.", amount: "450.000", status: "Lunas" },
                        { name: "Unit B-03 · Ratna K.", amount: "450.000", status: "Lunas" },
                        { name: "Unit C-07 · Andi P.", amount: "450.000", status: "Proses" },
                      ].map((row) => (
                        <div key={row.name} className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                          <div className="h-1.5 w-20 bg-white/20 rounded" />
                          <div className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
                            row.status === "Lunas"
                              ? "bg-green-400/20 text-green-400"
                              : "bg-yellow-400/20 text-yellow-400"
                          }`}>
                            {row.status}
                          </div>
                        </div>
                      ))}
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
