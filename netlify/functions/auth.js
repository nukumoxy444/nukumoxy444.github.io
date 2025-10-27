// Using native fetch (Node 18+)

exports.handler = async (event, context) => {
  const { code } = event.queryStringParameters;

  if (!code) {
    return {
      statusCode: 400,
      body: 'Authorization code missing',
    };
  }

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID; // Set in Netlify env
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET; // Set in Netlify env
  const REDIRECT_URI = `https://nukumoxy.netlify.app/.netlify/functions/auth`;

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = await userResponse.json();

    // Redirect back to site with user data (or store in session)
    return {
      statusCode: 302,
      headers: {
        Location: `https://nukumoxy.netlify.app/?userId=${userData.id}&username=${encodeURIComponent(userData.username)}&avatar=${userData.avatar || ''}`,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
