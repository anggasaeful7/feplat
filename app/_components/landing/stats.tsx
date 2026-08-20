const stats = [
  {
    value: "240+",
    label: "Cluster aktif",
    desc: "di seluruh Indonesia",
  },
  {
    value: "18.400",
    label: "Penghuni terdaftar",
    desc: "menggunakan aplikasi",
  },
  {
    value: "Rp 4,2M",
    label: "Iuran dikelola/bulan",
    desc: "rata-rata per cluster",
  },
  {
    value: "99,2%",
    label: "Tingkat kepuasan",
    desc: "berdasarkan survei pengguna",
  },
];

export function Stats() {
  return (
    <section className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 first:pl-0 last:pr-0">
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-foreground mb-0.5">{stat.label}</p>
              <p className="text-xs text-muted">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
