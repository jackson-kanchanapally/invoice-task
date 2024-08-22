const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const billingapi = await cds.connect.to("API_BILLING_DOCUMENT_SRV");

  this.on("READ", "BillingInfo", async (req) => {
    try {
      req.query.SELECT.columns = [
        "BillingDocument",
        "SDDocumentCategory",
        "SalesOrganization",
        "BillingDocumentDate",
        "TotalNetAmount",
        "FiscalYear",
        "CompanyCode",
        "LastChangeDateTime",
      ];

      const res = await billingapi.run(req.query);
      return res;
    } catch (error) {
      console.error("Error during request to remote service:", error);
      req.error(502, "Error during request to remote service");
    }
  });

  this.on("READ", "BillingItem", async (req) => {
    try {
      req.query.SELECT.columns = [
        "BillingDocumentItem",
        "BillingDocumentItemText",
        "BaseUnit",
        "BillingQuantityUnit",
        "Plant",
        "StorageLocation",
        "BillingDocument",
        "NetAmount",
        "TransactionCurrency",
      ];

      const res = await billingapi.run(req.query);
      return res;
    } catch (error) {
      console.error("Error during request to remote service:", error);
      req.error(502, "Error during request to remote service");
    }
  });

  this.on("BillingFetch", "Billing", async (req) => {
    try {
      await cds.tx(async () => {
        console.log("Executing BillingFetch action");

        // Uncomment the following code for the actual fetch logic

        // // Fetch the last synchronization date
        // const lastsyncdate1 = await cds.run(SELECT.one.from('Billing').columns('LastChangeDateTime').orderBy('LastChangeDateTime desc'));

        // let billlastsyncdatetime;
        // if (lastsyncdate1) {
        //     billlastsyncdatetime = lastsyncdate1.LastChangeDateTime;
        // }

        // // Count and fetch billing documents based on last sync date
        // let countbilldocs;
        // let billdocqry = SELECT.from('Billing');
        // if (billlastsyncdatetime) {
        //     countbilldocs = await billingapi.send({ method: 'GET', path: `A_BillingDocument/$count?$filter=LastChangeDateTime gt datetimeoffset'${billlastsyncdatetime}'` });
        //     billdocqry = billdocqry.where({ LastChangeDateTime: { gt: billlastsyncdatetime } });
        // } else {
        //     countbilldocs = await billingapi.send({ method: 'GET', path: 'A_BillingDocument/$count' });
        // }

        // // Process in batches of 5000
        // let batchSize = 5000;
        // for (let i = 0; i < countbilldocs; i += batchSize) {
        //     billdocqry = billdocqry.limit(batchSize, i);
        //     const results = await billingapi.run(billdocqry);
        //     console.log(`Processing Batch ${i} of ${countbilldocs} records`);
        //     await cds.run(UPSERT.into('Billing').entries(results));
        // }
      });

      return true;
    } catch (error) {
      console.error("Error during fetch operation:", error);
      req.error(500, "Error during fetch operation");
    }
  });

  this.before("READ", ["Billing", "BillingItems"], async (req) => {
    try {
      const { Billing, BillingItems } = this.entities;

      // Fetch existing records
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

      // Fetch new Billing documents
      let billingDocuments = await billingapi.run(
        SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocument").columns([
          "BillingDocument",
          "SDDocumentCategory",
          "SalesOrganization",
          "BillingDocumentDate",
          "TotalNetAmount",
          "FiscalYear",
          "CompanyCode",
          "LastChangeDateTime",
        ])
      );

      // Filter out existing Billing documents
      const uniqueBillingDocuments = billingDocuments.filter(
        (doc) => !existingBillingDocsMap.has(doc.BillingDocument)
      );
      const billingDocsToUpsert = uniqueBillingDocuments.map((doc) => ({
        ID: uuidv4(),
        ...doc,
      }));

      // UPSERT Billing documents
      if (billingDocsToUpsert.length > 0) {
        await cds.run(UPSERT.into(Billing).entries(billingDocsToUpsert));
      }

      // Fetch new Billing items
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

      // Filter out existing Billing items
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

      // UPSERT Billing items
      if (billingItemsToUpsert.length > 0) {
        await cds.run(UPSERT.into(BillingItems).entries(billingItemsToUpsert));
      }
    } catch (error) {
      console.error("Error during read operation:", error);
      req.error(500, "Error during read operation");
    }
  });
});
