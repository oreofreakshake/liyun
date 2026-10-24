import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const githubUrl = "https://github.com/oreofreakshake/liyun";

export function GithubMark({
  className = "size-[18px]",
}: {
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={GithubIcon}
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    />
  );
}
