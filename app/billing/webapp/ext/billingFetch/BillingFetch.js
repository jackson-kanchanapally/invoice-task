sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
  ],
  function (MessageBox, coreLibrary, BusyIndicator) {
    "use strict";
    return {
      fetch: function (oBindingContext, aSelectedContexts) {
        $.ajax({
          url: "/odata/v4/satinfotech/BillingFetch",
          type: "POST",
          contentType: "application/json",
          success: function (response) {
            MessageBox.success("Data submitted successfully.");
          },
          error: function (error) {
            MessageBox.error("Error occurred while submitting data.");
          },
        });
      },
    };
  }
);
