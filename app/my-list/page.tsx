import { Metadata } from "next";
import MyListClient from "./MyListClient";

export const metadata: Metadata = {
  title: "Danh sách của tôi",
};

export default function MyListPage() {
  return <MyListClient />;
}
