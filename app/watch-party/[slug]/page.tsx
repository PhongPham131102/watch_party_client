"use client";
import { useParams } from "next/navigation";

export default function RoomDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string | undefined;
  return <div>Room Detail Page for room: {slug}</div>;
}
