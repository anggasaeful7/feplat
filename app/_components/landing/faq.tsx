"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Apakah IPLSistem bisa digunakan untuk cluster yang baru terbentuk?",
    answer:
      "Ya, IPLSistem dirancang untuk cluster dari semua ukuran — mulai dari cluster kecil 10 unit hingga perumahan besar 500+ unit. Proses setup hanya butuh 15 menit.",
  },
  {
    question: "Bagaimana penghuni bisa mengakses informasi tagihan mereka?",
    answer:
      "Penghuni cukup mengunduh aplikasi mobile IPLSistem dari App Store atau Play Store. Setelah diundang oleh pengurus, mereka bisa langsung melihat tagihan, riwayat pembayaran, dan laporan keuangan cluster.",
  },
  {
    question: "Apakah penghuni bisa melihat laporan keuangan cluster?",
    answer:
      "Ya, itu salah satu fitur utama IPLSistem. Pengurus bisa mengatur level transparansi — dari sekedar total saldo hingga detail pengeluaran per pos. Ini membantu membangun kepercayaan penghuni.",
  },
  {
    question: "Apakah bisa digunakan tanpa smartphone?",
    answer:
      "Pengurus memerlukan akses web browser minimal untuk mengelola cluster. Namun untuk penghuni, tidak ada kewajiban menggunakan aplikasi — pengurus masih bisa mengelola pembayaran secara manual melalui dashboard.",
  },
  {
    question: "Berapa lama kontrak minimum penggunaan?",
    answer:
      "Tidak ada kontrak minimum. Anda bisa memulai dengan paket Gratis selamanya, atau berlangganan bulanan/tahunan untuk paket berbayar. Tidak ada denda pembatalan.",
  },
  {
    question: "Apakah data cluster aman dan terlindungi?",
    answer:
      "Keamanan data adalah prioritas utama kami. Semua data dienkripsi dengan standar AES-256, backup otomatis setiap hari, dan server kami berlokasi di Indonesia sesuai regulasi PDPN.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-surface-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 bg-brand-soft text-brand text-xs font-semibold px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            FAQ
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center leading-tight mb-4">
          Pertanyaan yang sering ditanyakan pengurus.
        </h2>
        <p className="text-center text-muted text-base sm:text-lg mb-12">
          Tidak menemukan jawaban? Hubungi tim kami lewat chat di pojok kanan
          bawah.
        </p>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                openIndex === index ? "border-brand/30 shadow-sm" : "border-border"
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-sm sm:text-base font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    openIndex === index
                      ? "bg-brand text-white rotate-45"
                      : "bg-surface-muted text-muted"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
