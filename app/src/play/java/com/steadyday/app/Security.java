package com.steadyday.app;

import android.content.Context;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;

/** Checks Google Play's signature on a purchase with the app's public licence key
 *  (Play Console › Monetization setup › Licensing). The key is added at build time from the
 *  ASCEND_PLAY_KEY secret. Without a key the purchase is still accepted from Google Play itself. */
final class Security {
 static boolean verify(Context c, String json, String signature) {
  String key = c.getString(R.string.ascend_play_key).trim();
  if (key.isEmpty()) return true;
  if (json == null || signature == null || signature.isEmpty()) return false;
  try {
   PublicKey pk = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.decode(key, Base64.DEFAULT)));
   Signature s = Signature.getInstance("SHA1withRSA");
   s.initVerify(pk);
   s.update(json.getBytes(StandardCharsets.UTF_8));
   return s.verify(Base64.decode(signature, Base64.DEFAULT));
  } catch (Exception e) { return false; }
 }
 private Security() {}
}
