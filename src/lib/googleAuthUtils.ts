import { pool } from "@/lib/db";
import { refreshAccessToken } from "@/lib/authOptions";

export async function getFreshGoogleAccessToken(userId: string | number): Promise<string | null> {
    if (!userId) {
        console.error("getFreshGoogleAccessToken: userId is required.");
        return null;
    }

    try {
        const [result] = await pool.query(
            `SELECT google_access_token, google_refresh_token, google_access_token_expires_at
             FROM users WHERE id = ?`,
            [userId]
        );
        const userTokens = (result as any[])[0];

        if (userTokens && userTokens.google_access_token && userTokens.google_refresh_token) {
            const expiresAt = userTokens.google_access_token_expires_at ? new Date(userTokens.google_access_token_expires_at).getTime() : 0;

            if (Date.now() < expiresAt - (5 * 60 * 1000)) {
                return userTokens.google_access_token;
            } else {
                const refreshedToken = await refreshAccessToken({
                    refreshToken: userTokens.google_refresh_token,
                    id: userId,
                } as any); // Type assertion is needed here because JWT type expects more properties than we have

                if (refreshedToken.accessToken) {
                    return refreshedToken.accessToken;
                } else {
                    console.error("getFreshGoogleAccessToken: Failed to refresh token for user:", userId, refreshedToken.error);
                    return null;
                }
            }
        } else {
            console.error("getFreshGoogleAccessToken: No Google tokens found in DB for user:", userId);
            return null;
        }
    } catch (error) {
        console.error("getFreshGoogleAccessToken: Error fetching/refreshing token from DB:", error);
        return null;
    }
}