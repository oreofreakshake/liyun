export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 171 179" className={className} aria-hidden="true">
      <rect width="171" height="178.471" rx="36" fill="#000" />
      <g fill="#fff" stroke="#fff" strokeWidth="5" strokeLinejoin="round">
        <path d="M49.8059 51.4659C56.3541 38.4063 81.7647 25.3179 81.7647 25.3179L129.91 80.1043L55.2016 122.854C47.4465 85.3054 43.2577 64.5255 49.8059 51.4659Z" />
        <path d="M80.9345 122.024L59.767 131.155L80.1044 148.172L80.9345 122.024Z" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = "text-[20px]" }: { size?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-[-0.03em] ${size}`}
    >
      <LogoMark className="size-7" />
      Liyun
    </span>
  );
}
