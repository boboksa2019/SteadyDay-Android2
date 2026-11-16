package com.steadyday.app;

import android.app.*;
import android.content.*;
import android.media.AudioAttributes;
import android.os.Build;
import org.json.*;
import java.util.*;

public class ReminderReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c, Intent i) {
  String key = i.getStringExtra("key");
  if (key == null) return;
  try {
   // Recheck live data before showing: the item may have been completed, cancelled or deleted.
   SharedPreferences p = c.getSharedPreferences(ReminderScheduler.PREF, 0);
   JSONObject data = new JSONObject(p.getString("data", "{}"));
   boolean habit = i.getBooleanExtra("habit", false);
   JSONArray arr = data.optJSONArray(habit ? "habits" : "tasks");
   if (arr == null) return;
   JSONObject item = null;
   for (int n = 0; n < arr.length(); n++) { JSONObject x = arr.getJSONObject(n); if (key.equals(x.optString("id"))) { item = x; break; } }
   if (item == null) return;
   if (habit) {
    Calendar cal = Calendar.getInstance();
    int day = cal.get(Calendar.DAY_OF_WEEK) - 1;
    JSONArray days = item.optJSONArray("days");
    boolean due = false;
    if (days != null) for (int n = 0; n < days.length(); n++) if (days.optInt(n) == day) due = true;
    if (!due) return;
    String date = String.format(Locale.US, "%04d-%02d-%02d", cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH));
    JSONObject log = item.optJSONObject("log");
    if (log != null && log.optBoolean(date)) return;
   } else if (item.optBoolean("done") || ReminderScheduler.cancelled(item)) return;
   boolean hide = i.getBooleanExtra("hide", true);
   show(c, key, hide ? "" : item.optString("name"), i.getStringExtra("mode"), hide, i.getStringExtra("lang"));
  } catch (Exception e) { android.util.Log.e("Ascend", "notify", e); }
  finally { ReminderScheduler.schedule(c); }
 }

 static void show(Context c, String key, String name, String mode, boolean hide, String lang) {
  if (mode == null || "inapp".equals(mode)) return;
  boolean ar = "ar".equals(lang);
  String title = ar ? "تذكير لطيف من أسيند" : "A friendly Ascend reminder";
  String message = hide || name == null || name.isEmpty() ? (ar ? "لديك شيء مخطط له اليوم." : "You have something planned today.") : (ar ? "حان وقت: " : "Time for: ") + name;
  String channel = ReminderScheduler.CHANNEL_PREFIX + mode;
  NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
  boolean vibrate = mode.equals("vibrate") || mode.equals("both"), sound = mode.equals("sound") || mode.equals("both");
  if (Build.VERSION.SDK_INT >= 26) {
   String label = ar ? ("sound".equals(mode) ? "تذكيرات بالصوت" : "vibrate".equals(mode) ? "تذكيرات بالاهتزاز" : "both".equals(mode) ? "تذكيرات بالصوت والاهتزاز" : "تذكيرات صامتة")
                     : ("sound".equals(mode) ? "Reminders · sound" : "vibrate".equals(mode) ? "Reminders · vibration" : "both".equals(mode) ? "Reminders · sound + vibration" : "Reminders · silent");
   NotificationChannel ch = new NotificationChannel(channel, label, "silent".equals(mode) ? NotificationManager.IMPORTANCE_DEFAULT : NotificationManager.IMPORTANCE_HIGH);
   ch.enableVibration(vibrate);
   if (vibrate) ch.setVibrationPattern(new long[]{0, 350, 180, 350});
   if (!sound) ch.setSound(null, null);
   else ch.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION), new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build());
   nm.createNotificationChannel(ch);
  }
  Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
  PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, channel) : new Notification.Builder(c);
  b.setSmallIcon(R.drawable.ic_stat_ascend).setColor(0xFF2F6B52).setContentTitle(title).setContentText(message)
   .setAutoCancel(true).setContentIntent(pi).setCategory(Notification.CATEGORY_REMINDER).setPriority(Notification.PRIORITY_HIGH);
  if (Build.VERSION.SDK_INT < 26) {
   if (sound) b.setDefaults(Notification.DEFAULT_SOUND);
   if (vibrate) b.setVibrate(new long[]{0, 250, 150, 250});
  }
  try { nm.notify(ReminderScheduler.id(key), b.build()); }
  catch (SecurityException denied) { android.util.Log.e("Ascend", "Notification permission denied", denied); }
 }
}
