import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SectionMore({ href, label = "En savoir plus" }: { href: string; label?: string }) {
  return (
    <div className="section-more">
      <Link href={href}>
        {label} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
