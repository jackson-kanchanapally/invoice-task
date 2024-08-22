sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.hemanth.satinfotech.billing',
            componentId: 'BillingItemsObjectPage',
            contextPath: '/Billing/BillingItems'
        },
        CustomPageDefinitions
    );
});