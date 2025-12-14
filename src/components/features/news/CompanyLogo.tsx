"use client";

import { useState } from "react";
import Image from "next/image";

interface CompanyLogoProps {
  domain: string;
}

export function CompanyLogo({ domain }: CompanyLogoProps) {
  const [error, setError] = useState(false);
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  if (error) {
    return null;
  }

  return (
    <div className="absolute bottom-3 right-3">
      <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center p-1.5">
        <Image
          src={logoUrl}
          alt={domain}
          width={36}
          height={36}
          sizes="36px"
          className="w-9 h-9 object-contain rounded-full"
          unoptimized
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
