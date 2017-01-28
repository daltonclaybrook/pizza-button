/**
 * This is a sample that connects Lambda with IFTTT Maker channel. The event is
 * sent in this format: <serialNumber>-<clickType>.
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

'use strict';

const pizzapi = require('dominos');
// const https = require('https');
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
    const storeID = process.env.STORE_ID;
    const customerID = process.env.CUSTOMER_ID;
    const couponCode = process.env.COUPON_CODE;
    const cardNumber = process.env.CC_NUMBER;
    const securityCode = process.env.CC_SECURITY_CODE;
    const phoneNumber = process.env.PHONE_NUMBER;

    if (!storeID || !customerID || !couponCode || !cardNumber || !securityCode) {
        return callback("must supply environment variables")
    }

    const customer = createCustomer();
    var order = createOrder(customer, storeID);
    addItemsToOrder(order, couponCode);

    console.log('pricing order...');
    order.price((priceResult) => {
        console.log(`price result:\n${JSON.stringify(priceResult, null, 2)}`);
        if (priceResult.success) {
            // success
            // addPaymentToOrder(order, cardNumber, securityCode);
            // order.place((placeResult) => {
            //     console.log(`order result:\n${JSON.stringify(placeResult, null, 2)}`);
            //     if (placeResult.success) {
            //         // success
            //         callback(null, placeResult);
            //     } else {
            //         // error
            //         callback('an error occurred when placing the order');
            //     }
            // });
            sendMessage(phoneNumber, 'Everything seems to be going well');
            callback(null, 'everything seems to have worked');
        } else {
            // error
            sendMessage(phoneNumber, 'Your pizza could not be ordered because pricing failed.');
            callback('an error occurred when pricing the order');
        }
    });

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

    function createOrder(customer, storeID) {
        var order = new pizzapi.Order({
            customer: customer,
            storeID: storeID,
            deliveryMethod: 'Delivery'
        });
        delete order.OrderID;
        return order;
    }

    function addItemsToOrder(order, couponCode) {
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
            code: couponCode
        });
        
        delete coupon.isNew;
        order.addCoupon(coupon);
    }

    function addPaymentToOrder(order, cardNumber, securityCode) {
        var cardInfo = new order.PaymentObject();
        cardInfo.Amount = order.Amounts.Customer;
        cardInfo.Number = cardNumber;
        cardInfo.CardType = order.validateCC(cardNumber);
        cardInfo.Expiration = '0119';
        cardInfo.SecurityCode = securityCode;
        cardInfo.PostalCode = '75023';
        order.Payments.push(cardInfo);
    }

    function sendMessage(phoneNumber, message) {
        twilio.sendMessage({
            to: phoneNumber,
            from: '+18558554587',
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

