import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ContestsClient } from "./contests-client";

export const metadata: Metadata = {
    title: "Contests",
    description: "Upcoming coding contests from LeetCode, Codeforces, AtCoder, and more.",
};

export default async function ContestsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    return <ContestsClient />;
}
