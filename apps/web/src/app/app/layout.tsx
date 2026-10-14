import type { Metadata } from "next";
import { Casca } from "@/components/app/casca";
import { Tour } from "@/components/onboarding/tour";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LayoutDoApp({ children }: LayoutProps<"/app">) {
  return (
    <>
      <Casca>{children}</Casca>
      <Tour />
    </>
  );
}
