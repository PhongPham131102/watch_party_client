import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
