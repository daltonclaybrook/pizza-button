/**
 * This is an implementation of a pizza button using an AWS IoT Button
 *
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */

/* 
 * Environment Variables:
 * TWILIO_SID
 * TWILIO_TOKEN
 * TWILIO_TO - e.g. +18558554587
 * TWILIO_FROM - e.g. +18558554587
 * 
 * STORE_ID
 * CUSTOMER_ID
 * COUPON_CODE
 * CC_NUMBER
 * CC_SECURITY_CODE
 * CC_EXPIRATION
 * CC_ZIPCODE
 */

'use strict';

const pizzapi = require('dominos');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
    if (!validateEnvironmentVariables()) {
        return callback("missing some environment variables");
    }

    const clickType = event.clickType;
    if (clickType != 'LONG') {
        sendMessage('Hold the button for about two seconds to order a pizza.');
        return callback(null, `button click type: ${clickType}. Use LONG to order a pizza.`);
    } 

    const customer = createCustomer();
    var order = createOrder(customer);
    addItemsToOrder(order);

    console.log('pricing order...');
    order.price((priceResult) => {
        console.log(`price result:\n${JSON.stringify(priceResult, null, 2)}`);
        if (priceResult.success) {
            // success
            addPaymentToOrder(order);
            order.place((placeResult) => {
                console.log(`order result:\n${JSON.stringify(placeResult, null, 2)}`);
                if (placeResult.success) {
                    // success
                    const amount = placeResult.result.Order.Amounts.Customer;
                    var message = (amount) ? `You have been charged: $${amount}. ` : '';
                    message = message + 'Track your order here: https://www.dominos.com/en/pages/tracker/#/track/order/';
                    sendMessage(message);
                    callback(null, placeResult);
                } else {
                    // error
                    sendMessage('Something went wrong while attempting to order the pizza.');
                    callback(placeResult);
                }
            });
        } else {
            // error
            sendMessage('Your pizza could not be ordered because pricing failed.');
            callback(priceResult);
        }
    });

    // Helper Functions

    function validateEnvironmentVariables() {
        const toPhone = process.env.TWILIO_TO;
        const fromPhone = process.env.TWILIO_FROM;
        const storeID = process.env.STORE_ID;
        const customerID = process.env.CUSTOMER_ID;
        const couponCode = process.env.COUPON_CODE;
        const cardNumber = process.env.CC_NUMBER;
        const securityCode = process.env.CC_SECURITY_CODE;
        const cardExpiration = process.env.CC_EXPIRATION;
        const cardZipcode = process.env.CC_ZIPCODE;
        
        return (toPhone && fromPhone && storeID && customerID && couponCode && cardNumber && securityCode && cardExpiration && cardZipcode)
    }

    function createCustomer(customerID) {
        var customer = new pizzapi.Customer({
            firstName: 'Dalton',
            lastName: 'Claybrook',
            address: {
                Street: "3725 MCKINLEY DR",
			    City: "PLANO",
                Region: "TX",
                PostalCode: "75023-7205",
                Type: "House",
                Name: "3725 MCKIN",
                StreetName: "MCKINLEY DR"
            },
            email: 'daltonclaybrook@gmail.com',
            phone: '8066320911'
        });
        customer.ID = customerID;
        return customer;
    }

    function createOrder(customer) {
        var order = new pizzapi.Order({
            customer: customer,
            storeID: process.env.STORE_ID,
            deliveryMethod: 'Delivery'
        });
        delete order.OrderID;
        return order;
    }

    function addItemsToOrder(order) {
        //Dalton
        var daltonItem = new pizzapi.Item({
            code: '12SCREEN', // medium hand-tossed pizza
            options: [
                'N', // pineapple
                'H' // ham
            ],
            quantity: 1
        });
        order.addItem(daltonItem);

        //Lindsey
        var lindseyItem = new pizzapi.Item({
            code: '12SCREEN', // medium hand-tossed pizza
            options: [
                'P', // pepperoni
                'R', // black olives
                'G' // green peppers
            ],
            quantity: 1
        });
        order.addItem(lindseyItem);

        //Coupon
        var coupon = new pizzapi.Coupon({
            code: process.env.COUPON_CODE
        });
        
        delete coupon.isNew;
        order.addCoupon(coupon);
    }

    function addPaymentToOrder(order) {
        var cardInfo = new order.PaymentObject();
        const cardNumber = process.env.CC_NUMBER;
        cardInfo.Amount = order.Amounts.Customer;
        cardInfo.Number = cardNumber;
        cardInfo.CardType = order.validateCC(cardNumber);
        cardInfo.Expiration = process.env.CC_EXPIRATION;
        cardInfo.SecurityCode = process.env.CC_SECURITY_CODE;
        cardInfo.PostalCode = process.env.CC_ZIPCODE;
        order.Payments.push(cardInfo);
    }

    function sendMessage(message) {
        twilio.sendMessage({
            to: process.env.TWILIO_TO,
            from: process.env.TWILIO_FROM,
            body: message
        }, function(err, responseData) { //this function is executed when a response is received from Twilio
            if (err) { 
                console.log(`error sending message:\n${JSON.stringify(err, null, 2)}`);
            } else {
                console.log(`sent message:\n${JSON.stringify(responseData, null, 2)}`);
            }
        });
    }
};

