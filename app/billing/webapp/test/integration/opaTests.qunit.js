sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/hemanth/satinfotech/billing/test/integration/FirstJourney',
		'com/hemanth/satinfotech/billing/test/integration/pages/BillingList',
		'com/hemanth/satinfotech/billing/test/integration/pages/BillingObjectPage',
		'com/hemanth/satinfotech/billing/test/integration/pages/BillingItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, BillingList, BillingObjectPage, BillingItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/hemanth/satinfotech/billing') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBillingList: BillingList,
					onTheBillingObjectPage: BillingObjectPage,
					onTheBillingItemsObjectPage: BillingItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);