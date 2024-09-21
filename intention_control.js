document.addEventListener('DOMContentLoaded', function() {
    const startForm = document.getElementById('intentionForm');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const loadFileBtn = document.getElementById('loadFileBtn');
    const loadFileInput = document.getElementById('loadFile');
    const repostCheckbox = document.getElementById('repostCheckbox');
    const intentionStatus = document.getElementById('intentionStatus');
    const submittedIntention = document.getElementById('submittedIntention');
    const intentionInput = document.getElementById('intentionInput');
    const timerElement = document.getElementById('timer');

    let lastIntention = ''; // Variable to store the last intention
    let timerInterval; // To keep track of the timer interval
    let repostInterval; // To handle reposting every hour

    // Event listener for the "Load File" button
    loadFileBtn.addEventListener('click', function() {
        loadFileInput.click(); // Open the file dialog
    });

    // When a file is selected, calculate its SHA-512 hash and append it to the intention
    loadFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                // Hash the file contents using SHA-512
                crypto.subtle.digest('SHA-512', arrayBuffer)
                    .then(hash => {
                        const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                        // Append the hash directly without brackets
                        intentionInput.value += `\n${hashHex}`;
                    })
                    .catch(error => console.error('Error calculating hash:', error));
            };
            reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
        }
    });

    // Function to start the timer
    function startTimer() {
        let startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
            timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    // Function to stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
        timerElement.textContent = '00:00:00'; // Reset the timer
    }

    // Function to send intention to Servitor
    function sendIntention() {
        const formData = new FormData(startForm);
        const intention = formData.get('intention'); // Get current intention

        // Send intention to Servitor
        fetch('start_intention.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log("Intention reposted:", intention);
        })
        .catch(error => console.error('Error:', error));
    }

    // Handle the form submission (Start Intention)
    startForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const formData = new FormData(startForm);
        lastIntention = formData.get('intention'); // Store the intention before sending

        // Send intention to Servitor
        sendIntention();

        // Show the submitted intention
        submittedIntention.textContent = `\n${lastIntention}`;

        // Show the "Stop" button and hide the form
        intentionStatus.classList.remove('hidden');
        startForm.classList.add('hidden');

        // Start the timer
        startTimer();

        // If the repost checkbox is checked, start reposting every hour
        if (repostCheckbox.checked) {
            repostInterval = setInterval(sendIntention, 3600000); // 1 hour = 3600000 ms
        }
    });

    // Handle the "Stop" button click
    stopBtn.addEventListener('click', function() {
        fetch('stop_intention.php', {
            method: 'POST',
            body: new URLSearchParams({ intention: '' })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);

            // Hide the "Stop" button and show the form for a new intention
            intentionStatus.classList.add('hidden');
            startForm.classList.remove('hidden');

            // Put the last intention back into the input field
            intentionInput.value = lastIntention;

            // Stop the timer and reposting
            stopTimer();
            clearInterval(repostInterval);
        })
        .catch(error => console.error('Error:', error));
    });
});
