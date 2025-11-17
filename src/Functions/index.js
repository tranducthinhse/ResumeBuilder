import * as functions from "firebase-functions";
import fetch from "node-fetch";
import * as admin from "firebase-admin";

admin.initializeApp();

export const linkedinAuth = functions.https.onRequest(async (req, res) => {
  const code = req.query.code;

  const clientId = "773wzhxigm4m7q";
  const clientSecret = "YOUR_LINKEDIN_CLIENT_SECRET";
  const redirectUri = "http://localhost:5173/auth/linkedin";

  try {
    // 1️⃣ Đổi code sang access_token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2️⃣ Lấy thông tin người dùng từ LinkedIn
    const profileRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailRes = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const profile = await profileRes.json();
    const emailData = await emailRes.json();

    const email = emailData.elements?.[0]?.["handle~"]?.emailAddress || "unknown@linkedin.com";

    // 3️⃣ Tạo custom token Firebase
    const uid = `linkedin:${profile.id}`;
    const firebaseToken = await admin.auth().createCustomToken(uid, {
      email,
      name: profile.localizedFirstName + " " + profile.localizedLastName,
    });

    // 4️⃣ Trả token về cho frontend
    res.json({ token: firebaseToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
