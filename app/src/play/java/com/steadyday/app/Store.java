package com.steadyday.app;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import org.json.JSONObject;
import java.util.Collections;
import java.util.List;

/** Google Play edition: "Ascend Premium" is a one-time, non-consumable in-app product.
 *  Create it in Play Console › Monetize › Products › In-app products with the ID below. */
final class Store {
 static final String PRODUCT = "ascend_premium";
 static BillingClient client;
 static ProductDetails details;
 static MainActivity act;
 static String price = "";
 static String state = "connecting"; // connecting | ready | unavailable

 static void init(MainActivity a) {
  act = a;
  if (client != null) { if (client.isReady()) refresh(); return; }
  client = BillingClient.newBuilder(a.getApplicationContext())
   .setListener(Store::onPurchases)
   .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
   .enableAutoServiceReconnection()
   .build();
  client.startConnection(new BillingClientStateListener() {
   @Override public void onBillingSetupFinished(BillingResult r) {
    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) { state = "ready"; refresh(); }
    else { state = "unavailable"; changed(); }
   }
   @Override public void onBillingServiceDisconnected() { state = "connecting"; changed(); }
  });
 }

 static void refresh() { queryProduct(); query(false); }

 static void queryProduct() {
  QueryProductDetailsParams p = QueryProductDetailsParams.newBuilder()
   .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
    .setProductId(PRODUCT).setProductType(BillingClient.ProductType.INAPP).build()))
   .build();
  client.queryProductDetailsAsync(p, (r, result) -> {
   if (r.getResponseCode() == BillingClient.BillingResponseCode.OK && result != null) {
    for (ProductDetails d : result.getProductDetailsList()) {
     if (!PRODUCT.equals(d.getProductId())) continue;
     details = d;
     ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
     if (o != null) price = o.getFormattedPrice();
    }
   }
   changed();
  });
 }

 /** Reads what Google Play says this account owns. Also revokes Premium after a refund. */
 static void query(boolean userAsked) {
  if (client == null || !client.isReady()) { if (userAsked) event("restore", "error"); return; }
  client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(), (r, list) -> {
   if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) { if (userAsked) event("restore", "error"); return; }
   boolean owned = false;
   if (list != null) for (Purchase p : list) if (handle(p)) owned = true;
   boolean before = Premium.owned(act);
   if (!owned) Premium.set(act, false, null);
   if (userAsked) event("restore", owned ? "owned" : "none");
   else if (owned != before) event("purchase", owned ? "owned" : "revoked");
   changed();
  });
 }

 static boolean handle(Purchase p) {
  if (!p.getProducts().contains(PRODUCT)) return false;
  if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) { event("purchase", "pending"); return false; }
  if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return false;
  if (!Security.verify(act, p.getOriginalJson(), p.getSignature())) return false;
  if (!p.isAcknowledged()) client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(), r -> {});
  Premium.set(act, true, p.getPurchaseToken());
  return true;
 }

 static void onPurchases(BillingResult r, List<Purchase> list) {
  int code = r.getResponseCode();
  if (code == BillingClient.BillingResponseCode.OK && list != null) {
   boolean owned = false;
   for (Purchase p : list) if (handle(p)) owned = true;
   if (owned) event("purchase", "owned");
  } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) event("purchase", "cancelled");
  else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) query(true);
  else event("purchase", "error");
  changed();
 }

 static void buy(MainActivity a) {
  act = a;
  if (client == null || !client.isReady() || details == null) { event("purchase", "unavailable"); init(a); return; }
  BillingFlowParams flow = BillingFlowParams.newBuilder()
   .setProductDetailsParamsList(Collections.singletonList(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details).build()))
   .build();
  client.launchBillingFlow(a, flow);
 }

 static void restore(MainActivity a) { act = a; if (client == null) init(a); query(true); }

 static String state(MainActivity a) {
  try { return new JSONObject().put("state", state).put("owned", Premium.owned(a)).put("price", price).put("product", details != null).toString(); }
  catch (Exception e) { return "{}"; }
 }

 static void event(String type, String value) { if (act != null) act.js("window.ascendNativeEvent&&ascendNativeEvent('" + type + "','" + value + "')"); }
 static void changed() { event("store", "changed"); }
 private Store() {}
}
