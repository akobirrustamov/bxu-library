import axios from "axios";

export let baseUrl = "http://localhost:8080";

// Get the DOM element
let myNote = document.getElementById("my-note");
console.log("hi2");

// Fetch and display contents
async function fetchAndDisplayContents() {
    console.log("hi");
    try {
        // Perform the GET request using axios
        let response = await axios({
            url: `${baseUrl}/api/v1/book/all`, // Full URL
            method: 'GET', // HTTP method
        });

        console.log(response.data);

        // Check for successful response
        if (response.status === 200 && response.data) {
            myNote.innerHTML = '';
            console.log(response.data);

            if (Array.isArray(response.data)) {
                // Loop through the content and display it
                response.data.forEach(content => {
                    let contentElement = document.createElement('div');
                    contentElement.textContent = content.name || content; // Adjust based on your API structure
                    contentElement.classList.add('content-item'); // Optional: Add class for styling
                    myNote.appendChild(contentElement);
                });
            } else {
                // Handle cases where the response is not an array
                myNote.innerHTML = 'No content available!';
            }
        } else {
            myNote.innerHTML = 'Failed to fetch content. Please try again.';
            console.error('Error fetching content:', response);
        }
    } catch (error) {
        console.error('Error:', error);
        myNote.innerHTML = 'An unexpected error occurred!';
    }
}

// Call the function to fetch and display contents
fetchAndDisplayContents();
