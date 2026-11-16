package com.steadyday.app;

import android.app.*;
import android.content.*;
import android.os.Build;
import org.json.*;
import java.util.*;

public class ReminderScheduler {
 static final String PREF = "reminders";
 static final String CHANNEL_PREFIX = "ascend40_alert_";

 static void saveAndSchedule(Context c, String config, String data, String lang) {
  c.getSharedPreferences(PREF, 0).edit().putString("config", config).putString("data", data).putString("lang", lang).apply();
  schedule(c);
 }

 static synchronized void schedule(Context c) {
  SharedPreferences prefs = c.getSharedPreferences(PREF, 0);
  try {
   JSONObject cfg = new JSONObject(prefs.getString("config", "{}"));
   JSONObject data = new JSONObject(prefs.getString("data", "{}"));
   JSONObject items = cfg.optJSONObject("items");
   JSONArray habits = data.optJSONArray("habits"), tasks = data.optJSONArray("tasks");
   // Cancel old alarms first, including removed/completed items.
   for (String id : prefs.getStringSet("scheduled", Collections.emptySet())) cancel(c, id);
   Set<String> active = new HashSet<>();
   long[] next = {0};
   JSONArray upcoming = new JSONArray();
   String lang = prefs.getString("lang", "en");
   if (cfg.optBoolean("enabled") && items != null && !"inapp".equals(cfg.optString("mode", "inapp"))) {
    if (habits != null) for (int i = 0; i < habits.length(); i++) add(c, cfg, items, habits.getJSONObject(i), true, active, lang, next, upcoming);
    if (tasks != null) for (int i = 0; i < tasks.length(); i++) add(c, cfg, items, tasks.getJSONObject(i), false, active, lang, next, upcoming);
   }
   prefs.edit().putStringSet("scheduled", active).putLong("nextAt", next[0]).putString("upcoming", upcoming.toString()).apply();
  } catch (Exception e) { android.util.Log.e("Ascend", "schedule", e); }
 }

 static int id(String s) { return s.hashCode() & 0x7fffffff; }

 static void cancel(Context c, String key) {
  AlarmManager a = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
  Intent i = new Intent(c, ReminderReceiver.class).setAction("steadyday." + key);
  PendingIntent pi = PendingIntent.getBroadcast(c, id(key), i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_NO_CREATE);
  if (pi != null) { a.cancel(pi); pi.cancel(); }
 }

 static int[] clock(String s) {
  try { String[] p = s.split(":"); int h = Integer.parseInt(p[0]), m = Integer.parseInt(p[1]); if (h < 0 || h > 23 || m < 0 || m > 59) return null; return new int[]{h, m}; }
  catch (Exception e) { return null; }
 }

 static boolean cancelled(JSONObject item) {
  return item.optBoolean("cancelled") || "cancelled".equalsIgnoreCase(item.optString("status"));
 }

 /** Next trigger time in millis, or -1 when nothing should be scheduled. Package-visible for tests. */
 static long nextTrigger(JSONObject cfg, JSONObject opt, JSONObject item, boolean habit, long now) {
  int[] hm = clock(opt.optString("time", cfg.optString("time", "19:00")));
  if (hm == null) return -1;
  Calendar at = Calendar.getInstance();
  at.setTimeInMillis(now);
  at.set(Calendar.HOUR_OF_DAY, hm[0]); at.set(Calendar.MINUTE, hm[1]); at.set(Calendar.SECOND, 0); at.set(Calendar.MILLISECOND, 0);
  String date = habit ? "" : item.optString("date", "");
  boolean dated = date.matches("\\d{4}-\\d{2}-\\d{2}");
  if (dated) {
   // A dated task is reminded once, on its own date.
   String[] d = date.split("-");
   at.set(Integer.parseInt(d[0]), Integer.parseInt(d[1]) - 1, Integer.parseInt(d[2]));
  } else if (at.getTimeInMillis() <= now + 1000) {
   at.add(Calendar.DAY_OF_YEAR, 1);
  }
  if (habit) {
   JSONArray days = item.optJSONArray("days");
   if (days == null || days.length() == 0) return -1;
   boolean found = false;
   for (int offset = 0; offset < 8 && !found; offset++) {
    int weekday = at.get(Calendar.DAY_OF_WEEK) - 1;
    for (int j = 0; j < days.length(); j++) if (days.optInt(j, -1) == weekday) found = true;
    if (!found) at.add(Calendar.DAY_OF_YEAR, 1);
   }
   if (!found) return -1;
  }
  // Quiet hours move the reminder to the END of the quiet period (never earlier than requested).
  if (cfg.optBoolean("quiet")) {
   int a = minutes(cfg.optString("start", "22:00")), b = minutes(cfg.optString("end", "07:00"));
   int t = at.get(Calendar.HOUR_OF_DAY) * 60 + at.get(Calendar.MINUTE);
   if (a != b && (a < b ? (t >= a && t < b) : (t >= a || t < b))) {
    long original = at.getTimeInMillis();
    at.set(Calendar.HOUR_OF_DAY, b / 60); at.set(Calendar.MINUTE, b % 60);
    if (at.getTimeInMillis() <= original) at.add(Calendar.DAY_OF_YEAR, 1);
   }
  }
  if (at.getTimeInMillis() <= now + 1000) return -1; // dated task already past
  return at.getTimeInMillis();
 }

 static void add(Context c, JSONObject cfg, JSONObject items, JSONObject item, boolean habit, Set<String> active, String lang, long[] next, JSONArray upcoming) throws Exception {
  String key = item.optString("id");
  JSONObject opt = items.optJSONObject(key);
  if (key.isEmpty() || opt == null || !opt.optBoolean("enabled")) return;
  if (!habit && (item.optBoolean("done") || cancelled(item))) return;
  long when = nextTrigger(cfg, opt, item, habit, System.currentTimeMillis());
  if (when < 0) return;
  String mode = cfg.optString("mode", "inapp");
  Intent intent = new Intent(c, ReminderReceiver.class).setAction("steadyday." + key);
  intent.putExtra("key", key); intent.putExtra("mode", mode); intent.putExtra("hide", cfg.optBoolean("hide", true));
  intent.putExtra("lang", lang); intent.putExtra("habit", habit); intent.putExtra("sound", cfg.optString("sound", "chime")); intent.putExtra("when", when);
  PendingIntent pi = PendingIntent.getBroadcast(c, id(key), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  boolean exact = arm(c, when, pi);
  active.add(key);
  if (next[0] == 0 || when < next[0]) next[0] = when;
  upcoming.put(new JSONObject().put("key", key).put("name", item.optString("name")).put("habit", habit).put("when", when).put("exact", exact));
 }

 /** Arms one alarm. Uses Android's alarm-clock type, which fires at the exact minute even in
     battery-saving (Doze) mode. Returns false if only an approximate alarm was possible. */
 static boolean arm(Context c, long when, PendingIntent pi) {
  AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
  try {
   if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) {
    PendingIntent show = PendingIntent.getActivity(c, 7, new Intent(c, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    am.setAlarmClock(new AlarmManager.AlarmClockInfo(when, show), pi);
    return true;
   }
  } catch (SecurityException denied) { /* fall through to an approximate alarm */ }
  am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
  return false;
 }
 /** Next whole minute (hh:mm:00), at least 20 seconds away. */
 static long nextWholeMinute(long now) {
  Calendar at = Calendar.getInstance(); at.setTimeInMillis(now);
  at.set(Calendar.SECOND, 0); at.set(Calendar.MILLISECOND, 0); at.add(Calendar.MINUTE, 1);
  if (at.getTimeInMillis() - now < 20000) at.add(Calendar.MINUTE, 1);
  return at.getTimeInMillis();
 }
 /** Schedules a real test through the same alarm path as reminders, so delivery can be checked with the app closed. */
 static long scheduleTest(Context c, String lang) {
  JSONObject cfg; try { cfg = new JSONObject(c.getSharedPreferences(PREF, 0).getString("config", "{}")); } catch (Exception e) { cfg = new JSONObject(); }
  long when = nextWholeMinute(System.currentTimeMillis());
  Intent intent = new Intent(c, ReminderReceiver.class).setAction("steadyday.__test__");
  intent.putExtra("key", "__test__"); intent.putExtra("mode", cfg.optString("mode", "both")); intent.putExtra("lang", lang);
  intent.putExtra("sound", cfg.optString("sound", "chime")); intent.putExtra("when", when);
  PendingIntent pi = PendingIntent.getBroadcast(c, id("__test__"), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  arm(c, when, pi);
  return when;
 }
 static int minutes(String s) { int[] hm = clock(s); return hm == null ? 0 : hm[0] * 60 + hm[1]; }

 static void test(Context c, String mode, String lang) {
  String sound = "chime";
  try { sound = new JSONObject(c.getSharedPreferences(PREF, 0).getString("config", "{}")).optString("sound", "chime"); } catch (Exception ignored) {}
  ReminderReceiver.show(c, "test", "Ascend", mode, false, lang, sound);
 }
 /** Remove channels from older versions so Android settings only lists current ones. */
 static void cleanOldChannels(Context c) {
  if (Build.VERSION.SDK_INT < 26) return;
  NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
  for (NotificationChannel ch : nm.getNotificationChannels()) if (ch.getId().startsWith("ascend40_")) nm.deleteNotificationChannel(ch.getId());
 }
}
