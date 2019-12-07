document.addEventListener("DOMContentLoaded", function (event) {
    var __privateElement = $('.__PrivateStripeElement-input');
    var stripe = Stripe(__privateElement.data('key'));
    var client_secret = $('#button_paypal').data('secret');

    var elements = stripe.elements({
        locale: __privateElement.data('locale')
    });

    var style = {
        base: {
            color: '#32325d',
            lineHeight: '18px',
            fontFamily: '"Alice", serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#235d15'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    var card = elements.create('card', {style: style});

    card.mount('#card-element');

    card.addEventListener('change', function (event) {
        var displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        stripe.handleCardPayment(client_secret ,card).then(function (response) {
            if (response.error) {
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = response.error.message;
            } else if (response.paymentIntent && response.paymentIntent.status === 'succeeded') {
                window.location.replace("https://flomory.com/shop/done/");
            }
        });
    });
});


