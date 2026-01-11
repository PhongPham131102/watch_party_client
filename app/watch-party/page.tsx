import { Metadata } from "next";
import WatchPartyClient from "./WatchPartyClient";

export const metadata: Metadata = {
  title: "Phòng xem phim",
  description: "Tham gia hoặc tạo phòng để xem phim cùng bạn bè",
};

export default function WatchPartyPage() {
  return <WatchPartyClient />;
}
