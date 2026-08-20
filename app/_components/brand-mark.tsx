import Image from "next/image";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export function BrandMark({ size = "md" }: { size?: Size }) {
  return (
    <span
      className={`${sizes[size]} grid place-items-center overflow-hidden rounded-full bg-brand shadow-sm ring-1 ring-brand-strong/30`}
      aria-hidden
    >
      <Image
        src="/images/logo-ipl-removebg.png"
        alt="IPL logo"
        width={56}
        height={56}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}
