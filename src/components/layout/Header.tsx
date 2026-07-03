import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <Container className="flex h-14 items-center">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Divide
        </Link>
      </Container>
    </header>
  );
}
