import { HomepageHeader } from "@/components/sections/homepage-header";
import Footer from "@/components/sections/footer";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: BlogLayoutProps) {
  return (
    <>
      <HomepageHeader />
      <main className="pt-20 lg:pt-24">{children}</main>
      <Footer />
    </>
  );
}

