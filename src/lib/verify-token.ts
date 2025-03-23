const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

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

export default verifyToken;