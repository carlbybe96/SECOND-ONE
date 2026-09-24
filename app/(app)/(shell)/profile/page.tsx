import type { Metadata } from "next";
import MyProfileView from "./my-profile-view";

export const metadata: Metadata = { title: "Mon profil" };

export default function MyProfilePage() {
  return <MyProfileView />;
}
