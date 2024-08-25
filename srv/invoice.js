// const cds = require("@sap/cds");
// const { v4: uuidv4 } = require("uuid");

// module.exports = cds.service.impl(async function () {
//   const billingapi = await cds.connect.to("API_BILLING_DOCUMENT_SRV");

//   async function fetchAndUpsertBillingData() {
//     let processingLog = [];
//     try {
//       const { Billing, BillingItems } = this.entities;
//       const existingBillingDocs = await cds.run(
//         SELECT.from(Billing).columns(["BillingDocument"])
//       );
//       const existingBillingItems = await cds.run(
//         SELECT.from(BillingItems).columns([
//           "BillingDocument",
//           "BillingDocumentItem",
//         ])
//       );

//       const existingBillingDocsMap = new Map(
//         existingBillingDocs.map((doc) => [doc.BillingDocument, doc])
//       );
//       const existingBillingItemsMap = new Map(
//         existingBillingItems.map((item) => [
//           `${item.BillingDocument}-${item.BillingDocumentItem}`,
//           item,
//         ])
//       );
//       const lastsyncdate1 = await cds.run(
//         SELECT.one
//           .from(Billing)
//           .columns("LastChangeDateTime")
//           .orderBy("LastChangeDateTime desc")
//       );

//       let billlastsyncdatetime;
//       if (lastsyncdate1) {
//         billlastsyncdatetime = lastsyncdate1.LastChangeDateTime;
//       }
//       let countbilldocs;
//       let billdocqry = SELECT.from(
//         "API_BILLING_DOCUMENT_SRV.A_BillingDocument"
//       ).columns([
//         "BillingDocument",
//         "SDDocumentCategory",
//         "SalesOrganization",
//         "BillingDocumentDate",
//         "TotalNetAmount",
//         "FiscalYear",
//         "CompanyCode",
//         "LastChangeDateTime",
//       ]);

//       if (billlastsyncdatetime) {
//         countbilldocs = await billingapi.send({
//           method: "GET",
//           path: `A_BillingDocument/$count?$filter=LastChangeDateTime gt datetimeoffset'${billlastsyncdatetime}'`,
//         });
//         billdocqry = billdocqry.where({
//           LastChangeDateTime: { gt: billlastsyncdatetime },
//         });
//       } else {
//         countbilldocs = await billingapi.send({
//           method: "GET",
//           path: "A_BillingDocument/$count",
//         });
//       }
//       console.log(countbilldocs);
//       processingLog.push(`Total billing documents: ${countbilldocs}`);
//       let batchSize = 37;
//       for (let i = 0; i < countbilldocs; i += batchSize) {
//         let billingDocuments = await billingapi.run(
//           billdocqry.limit(batchSize, i)
//         );
//         let logMessage = `Processing Batch ${
//           i + 1
//         } of ${countbilldocs} records`;
//         console.log(`Processing Batch ${i + 1} of ${countbilldocs} records`);
//         processingLog.push(logMessage);
//         const uniqueBillingDocuments = billingDocuments.filter(
//           (doc) => !existingBillingDocsMap.has(doc.BillingDocument)
//         );
//         const billingDocsToUpsert = uniqueBillingDocuments.map((doc) => ({
//           ID: uuidv4(),
//           ...doc,
//         }));
//         if (billingDocsToUpsert.length > 0) {
//           await cds.run(UPSERT.into(Billing).entries(billingDocsToUpsert));
//         }
//       }
//       let billingItems = await billingapi.run(
//         SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem").columns([
//           "BillingDocumentItem",
//           "BillingDocumentItemText",
//           "BaseUnit",
//           "BillingQuantityUnit",
//           "Plant",
//           "StorageLocation",
//           "BillingDocument",
//           "NetAmount",
//           "TransactionCurrency",
//         ])
//       );
//       const uniqueBillingItems = billingItems.filter(
//         (item) =>
//           !existingBillingItemsMap.has(
//             `${item.BillingDocument}-${item.BillingDocumentItem}`
//           )
//       );
//       const billingItemsToUpsert = uniqueBillingItems.map((item) => ({
//         ID: uuidv4(),
//         ...item,
//       }));
//       if (billingItemsToUpsert.length > 0) {
//         return await cds.run(
//           UPSERT.into(BillingItems).entries(billingItemsToUpsert)
//         );
//       }
//       return { count: countbilldocs, log: processingLog };
//     } catch (error) {
//       console.error("Error during read operation:", error);
//       processingLog.push(`Error during read operation: ${error.message}`);
//       return { count: 0, log: processingLog };
//     }
//   }

//   this.on("BillingFetch", async (req) => {
//     try {
//       console.log("Starting BillingFetch operation");
//       const result = await fetchAndUpsertBillingData.call(this);
//       console.log("BillingFetch completed successfully", result);

//       if (result.log && Array.isArray(result.log)) {
//         result.log.push("BillingFetch completed successfully");
//       } else {
//         result.log = ["BillingFetch completed successfully"];
//       }

//       const response = { success: true, count: result.count, log: result.log };
//       console.log("Sending response:", JSON.stringify(response));
//       return response;
//     } catch (error) {
//       console.error("Detailed error during BillingFetch operation:", error);
//       return req.error(
//         500,
//         `Error during BillingFetch operation: ${error.message}`
//       );
//     }
//   });
// });
const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const billingapi = await cds.connect.to("API_BILLING_DOCUMENT_SRV");

  async function fetchAndUpsertBillingData() {
    let processingLog = [];
    try {
      const { Billing, BillingItems } = this.entities;
      const existingBillingDocs = await cds.run(
        SELECT.from(Billing).columns(["BillingDocument"])
      );
      const existingBillingItems = await cds.run(
        SELECT.from(BillingItems).columns([
          "BillingDocument",
          "BillingDocumentItem",
        ])
      );

      const existingBillingDocsMap = new Map(
        existingBillingDocs.map((doc) => [doc.BillingDocument, doc])
      );
      const existingBillingItemsMap = new Map(
        existingBillingItems.map((item) => [
          `${item.BillingDocument}-${item.BillingDocumentItem}`,
          item,
        ])
      );
      const lastsyncdate1 = await cds.run(
        SELECT.one
          .from(Billing)
          .columns("LastChangeDateTime")
          .orderBy("LastChangeDateTime desc")
      );

      let billlastsyncdatetime;
      if (lastsyncdate1) {
        billlastsyncdatetime = lastsyncdate1.LastChangeDateTime;
      }
      let countbilldocs;
      let billdocqry = SELECT.from(
        "API_BILLING_DOCUMENT_SRV.A_BillingDocument"
      ).columns([
        "BillingDocument",
        "SDDocumentCategory",
        "SalesOrganization",
        "BillingDocumentDate",
        "TotalNetAmount",
        "FiscalYear",
        "CompanyCode",
        "LastChangeDateTime",
      ]);

      if (billlastsyncdatetime) {
        countbilldocs = await billingapi.send({
          method: "GET",
          path: `A_BillingDocument/$count?$filter=LastChangeDateTime gt datetimeoffset'${billlastsyncdatetime}'`,
        });
        billdocqry = billdocqry.where({
          LastChangeDateTime: { gt: billlastsyncdatetime },
        });
      } else {
        countbilldocs = await billingapi.send({
          method: "GET",
          path: "A_BillingDocument/$count",
        });
      }
      console.log(countbilldocs);
      processingLog.push(`Total billing documents: ${countbilldocs}`);
      let batchSize = 37;
      for (let i = 0; i < countbilldocs; i += batchSize) {
        let billingDocuments = await billingapi.run(
          billdocqry.limit(batchSize, i)
        );
        let logMessage = `Processing Batch ${
          i + 1
        } of ${countbilldocs} records`;
        console.log(logMessage);
        processingLog.push(logMessage);
        const uniqueBillingDocuments = billingDocuments.filter(
          (doc) => !existingBillingDocsMap.has(doc.BillingDocument)
        );
        const billingDocsToUpsert = uniqueBillingDocuments.map((doc) => ({
          ID: uuidv4(),
          ...doc,
        }));
        if (billingDocsToUpsert.length > 0) {
          await cds.run(UPSERT.into(Billing).entries(billingDocsToUpsert));
        }
      }
      let billingItems = await billingapi.run(
        SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem").columns([
          "BillingDocumentItem",
          "BillingDocumentItemText",
          "BaseUnit",
          "BillingQuantityUnit",
          "Plant",
          "StorageLocation",
          "BillingDocument",
          "NetAmount",
          "TransactionCurrency",
        ])
      );
      const uniqueBillingItems = billingItems.filter(
        (item) =>
          !existingBillingItemsMap.has(
            `${item.BillingDocument}-${item.BillingDocumentItem}`
          )
      );
      const billingItemsToUpsert = uniqueBillingItems.map((item) => ({
        ID: uuidv4(),
        ...item,
      }));
      if (billingItemsToUpsert.length > 0) {
        await cds.run(UPSERT.into(BillingItems).entries(billingItemsToUpsert));
      }
      return { count: countbilldocs, log: processingLog };
    } catch (error) {
      console.error("Error during read operation:", error);
      processingLog.push(`Error during read operation: ${error.message}`);
      return { count: 0, log: processingLog };
    }
  }

  this.on("BillingFetch", async (req) => {
    try {
      console.log("Starting BillingFetch operation");
      const result = await fetchAndUpsertBillingData.call(this);
      console.log("BillingFetch completed successfully", result);

      if (result.log && Array.isArray(result.log)) {
        result.log.push("BillingFetch completed successfully");
      } else {
        result.log = ["BillingFetch completed successfully"];
      }

      const response = { success: true, count: result.count, log: result.log };
      console.log("Sending response:", JSON.stringify(response));
      return response;
    } catch (error) {
      console.error("Detailed error during BillingFetch operation:", error);
      return req.error(
        500,
        `Error during BillingFetch operation: ${error.message}`
      );
    }
  });
});
