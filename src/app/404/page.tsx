import { NotFoundView } from "@/components/pages/not-found-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found",
};

export default function Custom404Page() {
    return <NotFoundView />;
}
