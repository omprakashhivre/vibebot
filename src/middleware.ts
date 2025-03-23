import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

// ✅ Verify token with FastAPI
const verifyToken = async (token: string) => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/verify-token`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 200) {
            const data = await response.json();
            return data.isValid ? data.user : null;
        } else {
            console.error("Invalid token:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};

export async function middleware(req: NextRequest) {
    console.log("✅ Global Middleware: middleware called - 001");

    const { cookies } = req;
    const token = cookies.get("access_token")?.value || "";
    const { pathname } = req.nextUrl;

    const publicPaths = ["/"];
    const isPublicPath = publicPaths.includes(pathname);

    // ✅ Handle public paths
    if (isPublicPath) {
        console.log("✅ Public path detected...");
        if (token) {
            console.log("✅ Token found, verifying...");
            const userDetails = await verifyToken(token);
            if (userDetails) {
                console.log("✅ Token valid, redirecting to /interact...");
                return NextResponse.redirect(new URL("/interact", req.nextUrl.origin));
            }
        }
        console.log("✅ No token found, proceed to public path.");
        return NextResponse.next();
    }

    // ✅ Check for token on protected paths
    if (token) {
        console.log("✅ Token found, verifying...");
        const userDetails = await verifyToken(token);

        if (!userDetails) {
            console.log("❌ Invalid token, redirecting to /");
            return NextResponse.redirect(new URL("/", req.nextUrl.origin));
        }
        console.log("✅ Token valid, proceeding...");
        return NextResponse.next();
    } else {
        console.log("❌ No token, redirecting to /");
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
}

// ✅ Config - Apply Middleware to required paths
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
