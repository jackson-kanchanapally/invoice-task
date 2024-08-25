// sap.ui.define(
//   [
//     "sap/m/MessageBox",
//     "sap/ui/core/library",
//     "sap/ui/core/BusyIndicator",
//     "sap/m/MessageToast",
//   ],
//   function (MessageBox, coreLibrary, BusyIndicator) {
//     "use strict";
//     return {
//       fetch: function (oBindingContext, aSelectedContexts) {
//         $.ajax({
//           url: "/odata/v4/satinfotech/BillingFetch",
//           type: "POST",
//           contentType: "application/json",
//           success: function (response) {
//             BusyIndicator.hide();
//             if (response && response.count !== undefined) {
//               MessageBox.success(
//                 `Data submitted successfully. Count of billing documents: ${response.count}`
//               );
//             } else {
//               MessageBox.success("Data submitted successfully.");
//             }
//           },
//           error: function (error) {
//             MessageBox.error("Error occurred while submitting data.");
//           },
//         });
//       },
//     };
//   }
// );
sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox",
  ],
  function (
    MessageBox,
    coreLibrary,
    BusyIndicator,
    MessageToast,
    Dialog,
    Button,
    Text,
    VBox
  ) {
    "use strict";
    return {
      fetch: function (oBindingContext, aSelectedContexts) {
        BusyIndicator.show(0);
        $.ajax({
          url: "/odata/v4/satinfotech/BillingFetch",
          type: "POST",
          contentType: "application/json",
          success: function (response) {
            BusyIndicator.hide();
            console.log("Raw response:", response);
            console.log("Response type:", typeof response);
            console.log(
              "Response structure:",
              JSON.stringify(response, null, 2)
            );

            if (
              response &&
              response.value &&
              typeof response.value === "object"
            ) {
              // OData v4 might wrap the response in a 'value' property
              response = response.value;
            }

            if (response && response.success) {
              var logMessages =
                response.log && Array.isArray(response.log)
                  ? response.log
                  : ["No detailed log available"];

              var oDialog = new Dialog({
                title: "Processing Log",
                content: new VBox({
                  items: logMessages.map(function (logEntry) {
                    return new Text({ text: logEntry });
                  }),
                }),
                beginButton: new Button({
                  text: "Close",
                  press: function () {
                    oDialog.close();
                  },
                }),
                afterClose: function () {
                  oDialog.destroy();
                },
              });

              oDialog.open();

              MessageToast.show(
                `Data submitted successfully. Count of billing documents: ${
                  response.count || "N/A"
                }`
              );
            } else {
              console.log("Unexpected response format:", response);
              MessageBox.warning(
                "Operation completed, but with unexpected response format."
              );
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            BusyIndicator.hide();
            console.error("Error details:", jqXHR, textStatus, errorThrown);
            MessageBox.error(
              `Error occurred while submitting data. Status: ${textStatus}, Error: ${errorThrown}`
            );
          },
        });
      },
    };
  }
);
