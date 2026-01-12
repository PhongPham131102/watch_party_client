import { Metadata } from "next";
import GenreClient from "./GenreClient";

const GENRE_LABELS: Record<string, string> = {
  "hanh-dong": "Hành Động",
  "kinh-di": "Kinh Dị",
  "vien-tuong": "Viễn Tưởng",
  "lang-man": "Lãng Mạn",
  "hoat-hinh": "Hoạt Hình",
  "chinh-kich": "Chính Kịch",
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const readableGenre =
    GENRE_LABELS[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return {
    title: `${readableGenre} - Watch Party`,
  };
}

export default function GenrePage() {
  return <GenreClient />;
}
