import type { Metadata } from "next";
import RegisterView from "./register-view";

export const metadata: Metadata = { title: "Créer mon profil" };

export default function RegisterPage() {
  return <RegisterView />;
}
