// Update Discord button based on connection status
function updateDiscordButton(isConnected, username = '') {
    const discordBtn = document.getElementById('loginDiscord');

    if (isConnected) {
        discordBtn.innerHTML = `<i class="fas fa-user-check"></i> connected as ${username}`;
        discordBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        discordBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        discordBtn.title = 'Click to disconnect';

        // Add click handler to disconnect
        discordBtn.onclick = function() {
            disconnectDiscord();
        };
    } else {
        discordBtn.innerHTML = '<i class="fab fa-discord"></i> login with discord';
        discordBtn.style.background = 'linear-gradient(135deg, #5865f2, #4752c4)';
        discordBtn.style.border = 'none';
        discordBtn.title = 'Login with Discord';
        discordBtn.onclick = function() {
            connectDiscord();
        };
    }
}

// Connect to Discord function
function connectDiscord() {
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
}

// Disconnect from Discord function
function disconnectDiscord() {
    if (confirm('Are you sure you want to disconnect your Discord account? You will need to reconnect to auto-fill your details.')) {
        // Clear saved data
        localStorage.removeItem('discordUserData');

        // Clear form fields
        document.getElementById('userId').value = '';
        document.getElementById('userName').value = '';
        document.getElementById('userAvatar').value = '';

        // Update button state
        updateDiscordButton(false);

        // Show notification
        showNotification('Discord account disconnected successfully!', 'success');
    }
}

// Enhanced notification system
function showNotification(message, type) {
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = message;
    responseDiv.className = `response-message ${type}`;
    responseDiv.style.display = 'block';

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            responseDiv.style.display = 'none';
        }, 3000);
    }

    // Scroll to response message
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Discord OAuth functionality (legacy - now handled by connectDiscord function)
document.getElementById('loginDiscord').addEventListener('click', connectDiscord);

// Handle OAuth callback data and check for saved user data
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const username = urlParams.get('username');
    const avatar = urlParams.get('avatar');

    // Check if user data is in URL (OAuth callback)
    if (userId) {
        // Save user data to localStorage
        const userData = {
            userId: userId,
            username: username || '',
            avatar: avatar || '',
            connectedAt: new Date().toISOString()
        };
        localStorage.setItem('discordUserData', JSON.stringify(userData));

        // Populate form fields
        document.getElementById('userId').value = userId;
        document.getElementById('userName').value = username || '';
        document.getElementById('userAvatar').value = avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : '';

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Show success message
        showNotification('Discord account connected and saved!', 'success');
    } else {
        // Check for saved user data in localStorage
        const savedUserData = localStorage.getItem('discordUserData');
        if (savedUserData) {
            try {
                const userData = JSON.parse(savedUserData);
                // Check if data is not too old (optional: clear after 30 days)
                const connectedAt = new Date(userData.connectedAt);
                const daysSinceConnected = (new Date() - connectedAt) / (1000 * 60 * 60 * 24);

                if (daysSinceConnected < 30) {
                    // Auto-populate form with saved data
                    document.getElementById('userId').value = userData.userId;
                    document.getElementById('userName').value = userData.username;
                    document.getElementById('userAvatar').value = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.userId}/${userData.avatar}.png` : '';

                    // Update Discord button to show connected state
                    updateDiscordButton(true, userData.username);
                } else {
                    // Data is too old, clear it
                    localStorage.removeItem('discordUserData');
                    updateDiscordButton(false);
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('discordUserData');
                updateDiscordButton(false);
            }
        } else {
            updateDiscordButton(false);
        }
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
