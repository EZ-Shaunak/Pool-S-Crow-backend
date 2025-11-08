import * as productService from "../services/productService.js";

export async function list(req, res) {
  try {
    // expects unitPriceSmallest as string (ethers.parseUnits on frontend)
    const payload = req.body;
    console.log(
      "Creating listing with payload:",
      JSON.stringify(payload, null, 2),
    );
    const { product, escrowAddress, txHash } =
      await productService.createListing(payload);
    res.json({ success: true, product, escrowAddress, txHash });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listOpen(req, res) {
  try {
    const list = await productService.listOpenListings();
    res.json({ success: true, listings: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
