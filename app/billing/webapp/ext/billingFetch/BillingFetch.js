sap.ui.define(
  ["sap/m/MessageBox", "sap/ui/core/library", "sap/ui/core/BusyIndicator"],
  function (MessageBox, coreLibrary, BusyIndicator) {
    "use strict";
    return {
      fetch: function (oBindingContext, aSelectedContexts) {
        let mParameters = {
          contexts: aSelectedContexts[0],
          label: "Confirm",
          invocationGrouping: true,
        };
        this.editFlow
          .invokeAction("satinfotech.Billing", mParameters)
          .then(function (result) {
            BusyIndicator.show();
            console.log(result.value);
            BusyIndicator.hide();
            aSelectedContexts[0].getModel().refresh();
          });
      },
    };
  }
);
