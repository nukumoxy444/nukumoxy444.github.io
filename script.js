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
