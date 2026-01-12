import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./SearchClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const decodedQ = typeof q === "string" ? decodeURIComponent(q) : undefined;

  return {
    title: decodedQ ? `Tìm kiếm: ${decodedQ}` : "Tìm kiếm",
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040510]" />}>
      <SearchClient />
    </Suspense>
  );
}
