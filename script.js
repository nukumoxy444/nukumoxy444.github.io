// Handle Discord login
document.getElementById('loginDiscord').addEventListener('click', function() {
    const clientId = '1432418722756169849'; // Your Discord app's client ID
    const redirectUri = 'https://nukumoxy.netlify.app/.netlify/functions/auth'; // Your Netlify site URL
    const scope = 'identify';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
});

// Pre-fill form from URL parameters after OAuth
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const username = urlParams.get('username');
    const avatar = urlParams.get('avatar');

    if (userId) {
        document.getElementById('userId').value = userId;
        document.getElementById('userName').value = username || '';
        document.getElementById('userAvatar').value = avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : '';
        // Clear URL parameters for security
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

document.getElementById('bugForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const webhookUrl = document.getElementById('webhookUrl').value;
    const description = document.getElementById('description').value;
    const userName = document.getElementById('userName').value;
    const userAvatar = document.getElementById('userAvatar').value || null;
    const server = document.getElementById('server').value || 'Web Submission';
    const userId = document.getElementById('userId').value || 'N/A';

    // Format timestamp like in the original code
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hour12 = now.getHours() % 12 || 12;
    const minute = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'pm' : 'am';
    const timestamp = `${month}/${day}/${year} at ${hour12}:${minute} ${ampm}`;

    // Build embed payload matching the original code
    const embed = {
        title: "bug report",
        description: description,
        color: 0xff0000,
        author: {
            name: userName,
            icon_url: userAvatar
        },
        fields: [
            { name: "server", value: server, inline: true },
            { name: "timestamp", value: timestamp, inline: true },
            { name: "user id", value: userId, inline: true }
        ]
    };

    const payload = {
        embeds: [embed]
    };

    const responseDiv = document.getElementById('response');
    responseDiv.style.display = 'block';

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            responseDiv.className = 'success';
            responseDiv.textContent = 'Bug report sent successfully!';
            document.getElementById('bugForm').reset();
        } else {
            responseDiv.className = 'error';
            responseDiv.textContent = `Failed to send bug report: HTTP ${response.status}`;
        }
    } catch (error) {
        responseDiv.className = 'error';
        responseDiv.textContent = `Error sending bug report: ${error.message}`;
    }
});
