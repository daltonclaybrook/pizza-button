'use strict';

(function() {
    const index = require('./index');
    const event = {
        serialNumber: "abc123",
        batteryVoltage: "10mV",
        clickType: "LONG"
    };
    console.log('starting handler...');
    index.handler(event, {}, (err, body) => {
        if (err) {
            console.log(JSON.stringify(err, null, 2));

            // console.log(JSON.stringify(err.rootCategories, {}, 2));
            // console.log('');
            // console.log(JSON.stringify(err.menuByCode, null, 2));
            // console.log('');
            // console.log(JSON.stringify(err.menuData, null, 2));

            // for (var key in err.menuData) {
            //     var val = err.menuData[key];
            //     console.log(`key: ${key}, val: ${val}`);
            // }
            
        } else if (body) {
            if (typeof body === 'object') {
                console.log(`finished with body:\n${JSON.stringify(body, null, 2)}`);
            } else {
                console.log(`finished with body:\n${body}`);
            }
        } else {
            console.log('finished.');
        }
    });
})();