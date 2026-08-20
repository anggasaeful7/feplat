import { MapsExplorer } from "./_components/maps-explorer";

export default function MapsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Maps
        </h1>
        <p className="max-w-xl text-sm text-muted">
          Sebaran properti dan unit kosongnya. Warna pin mengikuti status
          okupansi — mulai dari yang merah.
        </p>
      </header>

      <MapsExplorer />
    </div>
  );
}
