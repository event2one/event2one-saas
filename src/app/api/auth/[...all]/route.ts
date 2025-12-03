import { auth } from "@/lib/auth"
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    const url = new URL(req.url);
    // Next.js strips the basePath (/saas), but Better Auth is configured to expect it.
    // We manually add it back to the request URL so Better Auth can match the route.
    if (!url.pathname.startsWith("/saas")) {
        url.pathname = "/saas" + url.pathname;
    }
    const newReq = new NextRequest(url, req);

    console.log("Better Auth GET URL (Rewritten):", newReq.url);
    try {
        return await auth.handler(newReq);
    } catch (e) {
        console.error("Better Auth GET Error:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: NextRequest) => {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/saas")) {
        url.pathname = "/saas" + url.pathname;
    }
    const newReq = new NextRequest(url, req);

    console.log("Better Auth POST URL (Rewritten):", newReq.url);
    try {
        return await auth.handler(newReq);
    } catch (e) {
        console.error("Better Auth POST Error:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
}
