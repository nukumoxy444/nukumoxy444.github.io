// Discord OAuth functionality
document.getElementById('loginDiscord').addEventListener('click', function() {
    const clientId = '1432418722756169849'; // nukumoxy bot id
    const redirectUri = 'https://nukumoxy.netlify.app/.netlify/functions/auth';
    const scope = 'identify';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    // Add loading state to Discord button
    const discordBtn = document.getElementById('loginDiscord');
    discordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> connecting...';
    discordBtn.disabled = true;

    // Redirect to Discord OAuth
    window.location.href = authUrl;
});

// Handle OAuth callback data
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const username = urlParams.get('username');
    const avatar = urlParams.get('avatar');

    if (userId) {
        document.getElementById('userId').value = userId;
        document.getElementById('userName').value = username || '';
        document.getElementById('userAvatar').value = avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : '';
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Form submission
document.getElementById('bugForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const responseDiv = document.getElementById('response');

    // Get form data
    const webhookUrl = document.getElementById('webhookUrl').value;
    const description = document.getElementById('description').value;
    const userName = document.getElementById('userName').value;
    const userAvatar = document.getElementById('userAvatar').value || null;
    const server = document.getElementById('server').value || 'web submission';
    const userId = document.getElementById('userId').value || 'N/A';

    // Generate timestamp
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hour12 = now.getHours() % 12 || 12;
    const minute = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'pm' : 'am';
    const timestamp = `${month}/${day}/${year} at ${hour12}:${minute} ${ampm}`;

    // Create Discord embed (1:1 of the original nux bug cmd)
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

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    loadingSpinner.style.display = 'flex';
    responseDiv.style.display = 'none';

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
            responseDiv.textContent = 'bug report sent successfully!';
            responseDiv.style.display = 'block';
            document.getElementById('bugForm').reset();
        } else {
            responseDiv.className = 'error';
            responseDiv.textContent = `failed to send bug report: HTTP ${response.status}`;
            responseDiv.style.display = 'block';
        }
    } catch (error) {
        responseDiv.className = 'error';
        responseDiv.textContent = `error sending bug report: ${error.message}`;
        responseDiv.style.display = 'block';
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        loadingSpinner.style.display = 'none';
    }
});
