import React, { useEffect } from 'react';

function Chatbot() {
    useEffect(() => {
        // Create the script tag
        const script = document.createElement('script');
        script.src = 'https://your-chatbot-url.com/chatbot.js'; // Replace with your chatbot script URL
        script.async = true;
        script.defer = true;

        // Append the script to the body or head
        document.body.appendChild(script);

        // Cleanup: remove the script when the component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []); // Empty dependency array ensures this runs only on mount and unmount

    return (
        <div>
            {/* The chatbot will render wherever the script places it */}
            <div id="chatbot-container"></div>
        </div>
    );
}

export default Chatbot;
