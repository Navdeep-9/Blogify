document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const usernameStatus = document.getElementById('username-status');
    const submitBtn = document.getElementById('submitBtn');

    usernameInput.addEventListener('input', async () => {
        const username = usernameInput.value.trim();

        if (username.length === 0) {
            usernameStatus.textContent = "Username not provided";
            usernameStatus.style.color = 'white';
            submitBtn.style.color = 'white';
            submitBtn.disabled = true;

        } else if (username.length < 6) {
            usernameStatus.textContent = "Username is too short";
            usernameStatus.style.color = 'red';
            submitBtn.style.color = 'red';
            submitBtn.disabled = true;
        } else {
            try {
                const response = await fetch('/check-username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });

                const result = await response.json();

                if (response.status === 200) {
                    usernameStatus.textContent = result.message;
                    usernameStatus.style.color = 'darkblue';
                    submitBtn.style.color = 'white';
                    submitBtn.disabled = false;
                } else {
                    usernameStatus.textContent = result.message;
                    usernameStatus.style.color = 'red';
                    submitBtn.style.color = 'red';
                    submitBtn.disabled = true;
                }
            } catch (error) {
                usernameStatus.textContent = 'Error checking username';
                usernameStatus.style.color = 'red';
                submitBtn.style.color = 'red';
                submitBtn.disabled = true;
            }
        }
    });
});
