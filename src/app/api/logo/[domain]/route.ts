import { NextRequest, NextResponse } from "next/server";

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  if (!BRANDFETCH_API_KEY) {
    return NextResponse.json(
      { error: "Brandfetch API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch brand data from Brandfetch API
    const response = await fetch(
      `https://api.brandfetch.io/v2/brands/${domain}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    const data = await response.json();

    // Find the best logo (prefer icon or logo)
    let logoUrl: string | null = null;

    // Try to find icon first (better for small display)
    const icons = data.logos?.filter((logo: { type: string }) => logo.type === "icon") || [];
    const logos = data.logos?.filter((logo: { type: string }) => logo.type === "logo") || [];

    // Get the first available format from icons or logos
    const findBestFormat = (logoArray: { formats: { src: string; format: string }[] }[]) => {
      for (const logo of logoArray) {
        if (logo.formats && logo.formats.length > 0) {
          // Prefer PNG or SVG
          const png = logo.formats.find((f: { format: string }) => f.format === "png");
          const svg = logo.formats.find((f: { format: string }) => f.format === "svg");
          return png?.src || svg?.src || logo.formats[0]?.src;
        }
      }
      return null;
    };

    logoUrl = findBestFormat(icons) || findBestFormat(logos);

    if (!logoUrl) {
      return NextResponse.json(
        { error: "No logo found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error("Brandfetch API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand data" },
      { status: 500 }
    );
  }
}
