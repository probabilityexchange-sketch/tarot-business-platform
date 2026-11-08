"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { pushEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  eventName: string;
  eventParams?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
};

export function TrackedLink({ href, eventName, eventParams, className, children }: TrackedLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => pushEvent(eventName, eventParams)}>
      {children}
    </Link>
  );
}
