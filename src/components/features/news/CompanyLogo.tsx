"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CompanyLogoProps {
  domain: string;
}

export function CompanyLogo({ domain }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`/api/logo/${domain}`);
        if (response.ok) {
          const data = await response.json();
          setLogoUrl(data.logoUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(`[Logo] ${domain}: Fetch error`, err);
        setError(true);
      }
    };

    fetchLogo();
  }, [domain]);

  if (!logoUrl || error) {
    return null;
  }

  return (
    <div className="absolute bottom-3 right-3">
      <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center p-1.5">
        <Image
          src={logoUrl}
          alt=""
          width={28}
          height={28}
          sizes="28px"
          className="w-7 h-7 object-contain"
          unoptimized
          onError={() => {
            setError(true);
          }}
        />
      </div>
    </div>
  );
}
