package com.steadyday.app;
import android.app.*;
import android.content.*;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import org.json.*;
import java.util.*;

public class ReminderReceiver extends android.content.BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){String key=i.getStringExtra("key");if(key==null)return;
  // Recheck live completion and due days before showing notification.
  try{android.content.SharedPreferences p=c.getSharedPreferences(ReminderScheduler.PREF,0);JSONObject data=new JSONObject(p.getString("data","{}"));JSONArray arr=data.optJSONArray(i.getBooleanExtra("habit",false)?"habits":"tasks");if(arr==null)return;JSONObject item=null;for(int n=0;n<arr.length();n++){JSONObject x=arr.getJSONObject(n);if(key.equals(x.optString("id"))){item=x;break;}}if(item==null)return;
   if(i.getBooleanExtra("habit",false)){Calendar cal=Calendar.getInstance();int day=cal.get(Calendar.DAY_OF_WEEK)-1;JSONArray days=item.optJSONArray("days");boolean due=false;if(days!=null)for(int n=0;n<days.length();n++)if(days.optInt(n)==day)due=true;if(!due){ReminderScheduler.schedule(c);return;}String date=String.format(Locale.US,"%04d-%02d-%02d",cal.get(Calendar.YEAR),cal.get(Calendar.MONTH)+1,cal.get(Calendar.DAY_OF_MONTH));JSONObject log=item.optJSONObject("log");if(log!=null&&log.optBoolean(date)){ReminderScheduler.schedule(c);return;}}
   else if(item.optBoolean("done")){ReminderScheduler.schedule(c);return;}
   show(c,key,i.getBooleanExtra("hide",true)?"":item.optString("name"),i.getStringExtra("mode"),i.getBooleanExtra("hide",true),i.getStringExtra("lang"));
  }catch(Exception e){android.util.Log.e("SteadyDay","notify",e);}finally{ReminderScheduler.schedule(c);}
 }
 static void show(Context c,String key,String name,String mode,boolean hide,String lang){
  if("inapp".equals(mode))return;
  boolean ar="ar".equals(lang);String title=ar?"تذكير لطيف من أسيند":"A friendly Ascend reminder";
  String message=hide||name.isEmpty()?(ar?"لديك شيء مخطط له اليوم.":"You have something planned today."):(ar?"حان وقت: ":"Time for: ")+name;
  String channel="ascend40_alert_"+mode;NotificationManager nm=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
  if(Build.VERSION.SDK_INT>=26){NotificationChannel ch=new NotificationChannel(channel,"Ascend "+mode,NotificationManager.IMPORTANCE_HIGH);ch.enableVibration(mode.equals("vibrate")||mode.equals("both"));if(mode.equals("vibrate")||mode.equals("both"))ch.setVibrationPattern(new long[]{0,350,180,350});if(mode.equals("vibrate")||mode.equals("silent"))ch.setSound(null,null);else ch.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION),new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build());nm.createNotificationChannel(ch);}
  Intent open=new Intent(c,MainActivity.class);PendingIntent pi=PendingIntent.getActivity(c,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(c,channel):new Notification.Builder(c);
  b.setSmallIcon(android.R.drawable.ic_popup_reminder).setContentTitle(title).setContentText(message).setAutoCancel(true).setContentIntent(pi).setPriority(Notification.PRIORITY_HIGH);
  if(Build.VERSION.SDK_INT<26){if("sound".equals(mode)||"both".equals(mode))b.setDefaults(Notification.DEFAULT_SOUND);if("vibrate".equals(mode)||"both".equals(mode))b.setVibrate(new long[]{0,250,150,250});}
  try{nm.notify(ReminderScheduler.id(key),b.build());}catch(SecurityException denied){android.util.Log.e("AscendReminder","Notification permission denied",denied);}
 }
}
