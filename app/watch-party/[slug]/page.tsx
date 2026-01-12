import { Metadata } from "next";
import RoomDetailClient from "./RoomDetailClient";
import { roomService } from "@/src/services/room.service";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const checkRoom = await roomService.checkRoom(slug);

    if (checkRoom?.data?.name) {
      return {
        title: `${checkRoom.data.name} - Watch Party`,
      };
    }
  } catch (error) {
    // console.error("Error fetching room for metadata:", error);
  }

  return {
    title: "Watch Party Room",
  };
}

export default function RoomPage() {
  return <RoomDetailClient />;
}
