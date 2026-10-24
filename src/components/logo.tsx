import Image from "next/image";

export function LogoMark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/images/logo.svg"
      alt=""
      width={89}
      height={128}
      className={className}
      priority
    />
  );
}

export function Wordmark({ size = "text-[20px]" }: { size?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-[-0.03em] ${size}`}
    >
      <LogoMark className="h-6 w-auto" />
      Liyun
    </span>
  );
}
