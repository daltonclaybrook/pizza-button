'use strict';

(function() {
    const pizzapi = require('dominos');
    process.env.STORE_ID = '6877';
    console.log('starting handler...');

    //MAIN

    const customer = createCustomer();
    var order = createOrder(customer);
    addItemsToOrder(order);

    order.price((priceResult) => {
        console.log(`price result:\n${JSON.stringify(priceResult, null, 2)}`);
        if (priceResult.success) {
            console.log("success!")
        } else {
            console.log("failure")
        }
    });

    // HELPERS

    function createCustomer(customerID) {
        var customer = new pizzapi.Customer({
            firstName: 'Dalton',
            lastName: 'Claybrook',
            address: {
                Street: "4700 W PARK BLVD",
			    City: "PLANO",
                Region: "TX",
                PostalCode: "75093-2340",
                Type: "Business",
                OrganizationName: "Katy Trail Ice House Outpose",
                StreetName: "W PARK BLVD"
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

        //Ranch
        var ranchItem = new pizzapi.Item({
            code: 'RANCH', // ranch
            options: [],
            quantity: 1
        });
        order.addItem(ranchItem);
    }

})();