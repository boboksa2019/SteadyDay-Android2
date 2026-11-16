package com.steadyday.app;

import android.content.Context;
import android.content.SharedPreferences;

/** Premium entitlement. The Full edition is always unlocked. The Play edition is unlocked only by a
 *  Google Play purchase (see Store in src/play). The result is cached privately on the device so
 *  Premium keeps working offline after it has been verified once. */
final class Premium {
 static final String PREF = "premium";
 static String edition(Context c) { return c.getString(R.string.ascend_edition); }
 static boolean owned(Context c) {
  return "full".equals(edition(c)) || c.getSharedPreferences(PREF, 0).getBoolean("owned", false);
 }
 static void set(Context c, boolean owned, String token) {
  SharedPreferences.Editor e = c.getSharedPreferences(PREF, 0).edit().putBoolean("owned", owned).putLong("checkedAt", System.currentTimeMillis());
  if (token != null) e.putString("token", token);
  e.apply();
 }
 private Premium() {}
}
