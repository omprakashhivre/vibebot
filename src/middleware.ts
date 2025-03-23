import { NextRequest, NextResponse } from "next/server";


export async function middleware(req: NextRequest) {
    console.log("✅ Global Middleware: middleware called - 001");

    // const { cookies } = req;
    // console.log(cookies);
    
    // const token = cookies.get("access_token")?.value || "";
    const { pathname } = req.nextUrl;
    console.log(pathname);
    

    // const publicPaths = ["/"];
    // const isPublicPath = publicPaths.includes(pathname);

    // // ✅ Handle public paths
    // if (isPublicPath) {
    //     console.log("✅ Public path detected...");
    //     if (token) {
    //         console.log("✅ Token found, verifying...");
    //         const userDetails = await verifyToken(token);
    //         if (userDetails) {
    //             console.log("✅ Token valid, redirecting to /interact...");
    //             return NextResponse.redirect(new URL("/interact", req.nextUrl.origin));
    //         }
    //     }
    //     console.log("✅ No token found, proceed to public path.");
    //     return NextResponse.next();
    // }

    // // ✅ Check for token on protected paths
    // if (token) {
    //     console.log("✅ Token found, verifying...");
    //     const userDetails = await verifyToken(token);

    //     if (!userDetails) {
    //         console.log("❌ Invalid token, redirecting to /");
    //         return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    //     }
    //     console.log("✅ Token valid, proceeding...");
    //     return NextResponse.next();
    // } else {
    //     console.log("❌ No token, redirecting to /");
    //     return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    // }
    return NextResponse.next()
}

// ✅ Config - Apply Middleware to required paths
export const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    //   "/((?!api/logs|api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
  };
