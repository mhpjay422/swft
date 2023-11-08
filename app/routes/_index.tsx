import type { MetaFunction } from "@remix-run/node";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

export const meta: MetaFunction = () => {
  return [
    { title: "SWFT" },
    { name: "description", content: "Welcome to SWFT!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1">
          <div className="mx-auto self-center">Body</div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
