import React, { useState, useEffect } from 'react';
import HeaderStrip from './HeaderStrip';
import ShopByCategory from './ShopbyCategory';
import BestSellers from './BestSellers';



function MainLandingPage({handleCartOpen, cartItems, isLoggedIn, user}) {

    useEffect(() => {
        // Check if the script is already added
        const existingScript = document.querySelector('script[src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
            script.async = true;

            script.onload = () => {
                console.log('Dialogflow script loaded successfully.');
            };

            script.onerror = () => {
                console.error('Error loading Dialogflow script.');
            };

            document.body.appendChild(script);
        }

        // Cleanup is unnecessary here since the script should persist
    }, []);


    return (
        <div>
            {/*Header Strip*/}
            <HeaderStrip handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>
            {/* Main Content */}
            <main className="main-content">
                <img src="/images/main-page.jpg" alt="Tea-Cup" style={{ height: '90%', width: '100%' }} />
                <ShopByCategory/>
                <BestSellers/>
            </main>
            

             {/* Dialogflow Messenger */}
             <df-messenger
                intent="WELCOME"
                chat-title="teabot"
                agent-id="37aa4c5c-49b2-4c8c-aec4-c9e7f33ea9e8"
                language-code="en"
            ></df-messenger>

        </div>
    );
}

export default MainLandingPage;
