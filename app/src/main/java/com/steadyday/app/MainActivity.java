package com.steadyday.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
 static final int REQ_NOTIFY = 23, REQ_SAVE = 41, REQ_OPEN = 42;
 WebView web;
 FrameLayout root;
 ValueCallback<Uri[]> pendingChooser;
 android.media.Ringtone preview;
 String pendingSaveContent, pendingSaveName;

 @Override public void onCreate(Bundle b) {
  super.onCreate(b);
  root = new FrameLayout(this);
  root.setBackgroundColor(Color.parseColor("#f2f6f0"));
  web = new WebView(this);
  WebSettings s = web.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(true);
  s.setAllowContentAccess(true);
  s.setMediaPlaybackRequiresUserGesture(true);
  web.setBackgroundColor(Color.TRANSPARENT);
  web.setWebViewClient(new WebViewClient());
  web.setWebChromeClient(new WebChromeClient() {
   // Without this, <input type=file> (backup import) silently does nothing in a WebView.
   @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> callback, FileChooserParams params) {
    if (pendingChooser != null) pendingChooser.onReceiveValue(null);
    pendingChooser = callback;
    Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    pick.addCategory(Intent.CATEGORY_OPENABLE);
    // .json files are often reported as octet-stream, so do not filter by MIME type.
    pick.setType("*/*");
    try { startActivityForResult(pick, REQ_OPEN); }
    catch (ActivityNotFoundException e) { pendingChooser = null; callback.onReceiveValue(null); toast("No file picker available"); return false; }
    return true;
   }
  });
  web.addJavascriptInterface(new Bridge(), "SteadyDayNative");
  root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
  setContentView(root);
  applyInsets();
  if (b != null) web.restoreState(b);
  else web.loadUrl("file:///android_asset/index.html");
  ReminderScheduler.cleanOldChannels(this);
  Store.init(this);
  // Android 13+ (and required on Android 16): Back goes through OnBackInvokedCallback, not onBackPressed().
  if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
  // Ask for notification permission once on first launch (Android 13+); later the app shows a clear fix button.
  if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
      && !getSharedPreferences(ReminderScheduler.PREF, 0).getBoolean("askedNotify", false)) {
   getSharedPreferences(ReminderScheduler.PREF, 0).edit().putBoolean("askedNotify", true).apply();
   requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
  }
  ReminderScheduler.schedule(this);
 }

 // Android 15 enforces edge-to-edge for targetSdk 35: keep content clear of status, navigation and keyboard.
 void applyInsets() {
  root.setOnApplyWindowInsetsListener((v, insets) -> {
   int l, t, r, btm;
   if (Build.VERSION.SDK_INT >= 30) {
    android.graphics.Insets sys = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
    android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
    l = sys.left; t = sys.top; r = sys.right; btm = Math.max(sys.bottom, ime.bottom);
   } else {
    l = insets.getSystemWindowInsetLeft(); t = insets.getSystemWindowInsetTop(); r = insets.getSystemWindowInsetRight(); btm = insets.getSystemWindowInsetBottom();
   }
   web.setPadding(0, 0, 0, 0);
   FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) web.getLayoutParams();
   lp.setMargins(l, t, r, btm);
   web.setLayoutParams(lp);
   return insets;
  });
  root.requestApplyInsets();
 }

 @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

 void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }

 boolean notificationsAllowed() {
  if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
  return ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).areNotificationsEnabled();
 }

 void js(String code) { runOnUiThread(() -> web.evaluateJavascript(code, null)); }

 class Bridge {
  @JavascriptInterface public void sync(String config, String data, String language) {
   runOnUiThread(() -> ReminderScheduler.saveAndSchedule(MainActivity.this, config, data, language));
  }
  @JavascriptInterface public void requestPermission() {
   runOnUiThread(() -> {
    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
     requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
    else if (!notificationsAllowed()) openNotificationSettings();
    else js("window.ascendNativeEvent&&ascendNativeEvent('permission','granted')");
   });
  }
  @JavascriptInterface public void openNotificationSettings() {
   runOnUiThread(() -> {
    Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
    intent.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
    try { startActivity(intent); } catch (Exception e) { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); }
   });
  }
  @JavascriptInterface public void openExactAlarmSettings() {
   runOnUiThread(() -> {
    if (Build.VERSION.SDK_INT < 31) return;
    try { startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName()))); }
    catch (Exception e) { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); }
   });
  }
  @JavascriptInterface public void openBatterySettings() {
   runOnUiThread(() -> {
    try { startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)); }
    catch (Exception e) { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); }
   });
  }
  /** Real Android status for the Reliability Center and reminder settings. */
  @JavascriptInterface public String status() {
   try {
    JSONObject o = new JSONObject();
    o.put("sdk", Build.VERSION.SDK_INT);
    boolean runtime = Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    o.put("permission", runtime);
    o.put("notificationsEnabled", nm.areNotificationsEnabled());
    JSONObject cfg = new JSONObject(getSharedPreferences(ReminderScheduler.PREF, 0).getString("config", "{}"));
    String mode = cfg.optString("mode", "inapp");
    o.put("mode", mode);
    boolean channelBlocked = false;
    if (Build.VERSION.SDK_INT >= 26) {
     NotificationChannel ch = nm.getNotificationChannel(ReminderReceiver.channelId(mode, ReminderReceiver.sound(MainActivity.this, cfg.optString("sound", "chime"))));
     channelBlocked = ch != null && ch.getImportance() == NotificationManager.IMPORTANCE_NONE;
    }
    o.put("channelBlocked", channelBlocked);
    AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
    o.put("exactAlarms", Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms());
    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
    o.put("batteryUnrestricted", pm.isIgnoringBatteryOptimizations(getPackageName()));
    o.put("scheduled", getSharedPreferences(ReminderScheduler.PREF, 0).getStringSet("scheduled", java.util.Collections.emptySet()).size());
    o.put("nextAt", getSharedPreferences(ReminderScheduler.PREF, 0).getLong("nextAt", 0));
    o.put("version", getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
    o.put("edition", getString(R.string.ascend_edition));
    return o.toString();
   } catch (Exception e) { return "{}"; }
  }
  /** What Android has actually scheduled: [{key,name,habit,when,exact}]. */
  @JavascriptInterface public String scheduled() { return getSharedPreferences(ReminderScheduler.PREF, 0).getString("upcoming", "[]"); }
  /** Arms a real alarm for the next whole minute; returns its time in millis (0 if notifications are blocked). */
  @JavascriptInterface public long testScheduled(String language) {
   if (!notificationsAllowed()) { runOnUiThread(() -> requestPermission()); return 0; }
   return ReminderScheduler.scheduleTest(MainActivity.this, language);
  }
  /** Premium status for the app UI: {state, owned, price}. */
  @JavascriptInterface public String premium() { return Store.state(MainActivity.this); }
  @JavascriptInterface public void buy() { runOnUiThread(() -> Store.buy(MainActivity.this)); }
  @JavascriptInterface public void restore() { runOnUiThread(() -> Store.restore(MainActivity.this)); }
  /** "full" or "play" — fixed at build time by the product flavour. */
  @JavascriptInterface public String edition() { return getString(R.string.ascend_edition); }
  /** Plays a reminder sound so the user can choose one. */
  @JavascriptInterface public void previewSound(String name) {
   runOnUiThread(() -> {
    try {
     if (preview != null && preview.isPlaying()) preview.stop();
     preview = android.media.RingtoneManager.getRingtone(MainActivity.this, ReminderReceiver.soundUri(MainActivity.this, ReminderReceiver.SOUNDS_CONTAINS(name) ? name : "chime"));
     if (preview != null) {
      if (Build.VERSION.SDK_INT >= 28) preview.setAudioAttributes(new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION_EVENT).setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
      preview.play();
     }
    } catch (Exception e) { toast("Could not play the sound"); }
   });
  }
  @JavascriptInterface public void test(String mode, String language) {
   runOnUiThread(() -> {
    boolean ar = "ar".equals(language);
    if ("inapp".equals(mode)) { toast(ar ? "وضع داخل التطبيق فقط: لا يُرسل إشعار أندرويد. اختر الصوت أو الاهتزاز." : "In-app only: no Android notification is sent. Choose Sound or Vibration."); return; }
    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
     requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
     toast(ar ? "اسمح بالإشعارات ثم اضغط تجربة مرة أخرى" : "Allow notifications, then tap Test again"); return;
    }
    if (!notificationsAllowed()) { toast(ar ? "إشعارات أسيند معطلة في إعدادات أندرويد" : "Ascend notifications are turned off in Android settings"); return; }
    ReminderScheduler.test(MainActivity.this, mode, language);
    toast(ar ? "تم إرسال إشعار تجريبي" : "Test notification sent");
   });
  }
  /** Save text to a user-chosen file (backup JSON, CSV, .ics). Blob downloads do not work in WebView. */
  @JavascriptInterface public void saveFile(String name, String mime, String content) {
   runOnUiThread(() -> {
    pendingSaveContent = content; pendingSaveName = name;
    Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    i.addCategory(Intent.CATEGORY_OPENABLE);
    i.setType(mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
    i.putExtra(Intent.EXTRA_TITLE, name);
    try { startActivityForResult(i, REQ_SAVE); }
    catch (ActivityNotFoundException e) { pendingSaveContent = null; js("window.ascendNativeEvent&&ascendNativeEvent('saved','error')"); }
   });
  }
  /** Status bar colour and icon contrast follow the active theme. */
  @JavascriptInterface public void setChrome(String color, boolean dark) {
   runOnUiThread(() -> {
    try {
     int c = Color.parseColor(color);
     root.setBackgroundColor(c);
     if (Build.VERSION.SDK_INT < 35) { getWindow().setStatusBarColor(c); getWindow().setNavigationBarColor(c); }
     if (Build.VERSION.SDK_INT >= 30) {
      WindowInsetsController wic = getWindow().getInsetsController();
      if (wic != null) {
       int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
       wic.setSystemBarsAppearance(dark ? 0 : mask, mask);
      }
     } else {
      View d = getWindow().getDecorView();
      int f = d.getSystemUiVisibility();
      f = dark ? (f & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR) : (f | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
      d.setSystemUiVisibility(f);
     }
    } catch (Exception ignored) {}
   });
  }
 }

 @Override protected void onActivityResult(int req, int res, Intent data) {
  super.onActivityResult(req, res, data);
  if (req == REQ_OPEN) {
   if (pendingChooser != null) {
    Uri[] result = (res == RESULT_OK && data != null && data.getData() != null) ? new Uri[]{data.getData()} : null;
    pendingChooser.onReceiveValue(result);
    pendingChooser = null;
   }
  } else if (req == REQ_SAVE) {
   String content = pendingSaveContent; pendingSaveContent = null;
   if (res != RESULT_OK || data == null || data.getData() == null || content == null) { js("window.ascendNativeEvent&&ascendNativeEvent('saved','cancelled')"); return; }
   try (OutputStream out = getContentResolver().openOutputStream(data.getData(), "wt")) {
    out.write(content.getBytes(StandardCharsets.UTF_8));
    js("window.ascendNativeEvent&&ascendNativeEvent('saved','ok')");
   } catch (Exception e) {
    js("window.ascendNativeEvent&&ascendNativeEvent('saved','error')");
   }
  }
 }

 @Override public void onRequestPermissionsResult(int req, String[] p, int[] r) {
  super.onRequestPermissionsResult(req, p, r);
  if (req == REQ_NOTIFY) {
   boolean ok = r.length > 0 && r[0] == PackageManager.PERMISSION_GRANTED;
   js("window.ascendNativeEvent&&ascendNativeEvent('permission','" + (ok ? "granted" : "denied") + "')");
   ReminderScheduler.schedule(this);
  }
 }

 @Override protected void onResume() {
  super.onResume();
  ReminderScheduler.schedule(this);
  Store.init(this);
  if (web != null) js("window.ascendNativeEvent&&ascendNativeEvent('resume','')");
 }

 // Back closes dialogs and returns to Today before leaving the app.
 void handleBack() {
  web.evaluateJavascript("(window.ascendHandleBack&&window.ascendHandleBack())?'1':'0'", v -> {
   if (!"\"1\"".equals(v)) finish();
  });
 }
 /** Only used on Android 12 and older; newer versions use the callback registered in onCreate. */
 @Override public void onBackPressed() { handleBack(); }
}
