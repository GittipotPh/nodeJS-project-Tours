import axios from "axios";
import { showAlert } from "./alert.js";
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe using loadStripe function
const stripePromise = loadStripe
('pk_test_51PBXTzJqVOqeYafqlijUVzdpFWuRCsfOfiZEZ2j0KOMZbsBXH7xeEf3SyPJNCJ5KfvfCIAZq5lMRmtCYBI8oIDHR00ZKmOPRwk');

export const bookTour = async tourId => {
    // 1) Get checkout session from API
    try {
        // Wait for Stripe to load
        const stripe = await stripePromise;

        // Make API request to get checkout session
        const response = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );

        const session = response.data.session;
        console.log(session);

        // 2) Create checkout form + charge credit card
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            console.error("Stripe checkout error:", result.error);
        }

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
