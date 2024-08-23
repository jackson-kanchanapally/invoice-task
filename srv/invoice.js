const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const billingapi = await cds.connect.to("API_BILLING_DOCUMENT_SRV");
  async function fetchAndUpsertBillingData() {
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
        return await cds.run(
          UPSERT.into(BillingItems).entries(billingItemsToUpsert)
        );
      }
    } catch (error) {
      console.error("Error during read operation:", error);
      throw error;
    }
  }

  this.on("BillingFetch", async (req) => {
    try {
      await fetchAndUpsertBillingData.call(this);
      console.log("BillingFetch completed successfully");
      return true;
    } catch (error) {
      console.error("Error during BillingFetch operation:", error);
      req.error(500, "Error during BillingFetch operation");
    }
  });
});
