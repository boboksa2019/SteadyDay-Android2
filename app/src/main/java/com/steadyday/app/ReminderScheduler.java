package com.steadyday.app;

import android.app.*;
import android.content.*;
import android.os.Build;
import org.json.*;
import java.util.*;

public class ReminderScheduler {
 static final String PREF="reminders";
 static final String[] MODES={"silent","sound","vibrate","both"};
 static void saveAndSchedule(Context c,String config,String data,String lang){c.getSharedPreferences(PREF,0).edit().putString("config",config).putString("data",data).putString("lang",lang).apply();schedule(c);}
 static void schedule(Context c){
  android.content.SharedPreferences prefs=c.getSharedPreferences(PREF,0);
  try{
   JSONObject cfg=new JSONObject(prefs.getString("config","{}"));JSONObject data=new JSONObject(prefs.getString("data","{}"));
   JSONObject items=cfg.optJSONObject("items");JSONArray habits=data.optJSONArray("habits"),tasks=data.optJSONArray("tasks");
   // Cancel old alarms first, including removed/completed items.
   Set<String> previous=prefs.getStringSet("scheduled",Collections.emptySet());
   for(String id:previous)cancel(c,id);
   Set<String> active=new HashSet<>();
   if(cfg.optBoolean("enabled")&&items!=null){
    if(habits!=null)for(int i=0;i<habits.length();i++)add(c,cfg,items,habits.getJSONObject(i),true,active,prefs.getString("lang","en"));
    if(tasks!=null)for(int i=0;i<tasks.length();i++)add(c,cfg,items,tasks.getJSONObject(i),false,active,prefs.getString("lang","en"));
   }
   prefs.edit().putStringSet("scheduled",active).apply();
  }catch(Exception e){android.util.Log.e("SteadyDay","schedule",e);}
 }
 static int id(String s){return s.hashCode() & 0x7fffffff;}
 static void cancel(Context c,String key){AlarmManager a=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);Intent i=new Intent(c,ReminderReceiver.class).setAction("steadyday."+key);PendingIntent pi=PendingIntent.getBroadcast(c,id(key),i,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_NO_CREATE);if(pi!=null){a.cancel(pi);pi.cancel();}}
 static void add(Context c,JSONObject cfg,JSONObject items,JSONObject item,boolean habit,Set<String> active,String lang)throws Exception{
  String key=item.optString("id");JSONObject opt=items.optJSONObject(key);if(key.isEmpty()||opt==null||!opt.optBoolean("enabled"))return;
  if(!habit&&item.optBoolean("done"))return;
  if(habit){JSONArray days=item.optJSONArray("days");if(days==null||days.length()==0)return;}
  String mode=cfg.optString("mode","inapp");if(mode.equals("inapp"))return;
  String clock=opt.optString("time",cfg.optString("time","19:00"));String[] parts=clock.split(":");if(parts.length!=2)return;
  Calendar at=Calendar.getInstance();at.set(Calendar.HOUR_OF_DAY,Integer.parseInt(parts[0]));at.set(Calendar.MINUTE,Integer.parseInt(parts[1]));at.set(Calendar.SECOND,0);at.set(Calendar.MILLISECOND,0);
  if(at.getTimeInMillis()<=System.currentTimeMillis())at.add(Calendar.DAY_OF_YEAR,1);
  // Quiet hours shift the reminder to the end of quiet hours.
  if(cfg.optBoolean("quiet")){String start=cfg.optString("start","22:00"),end=cfg.optString("end","07:00");int t=at.get(Calendar.HOUR_OF_DAY)*60+at.get(Calendar.MINUTE);int a=minutes(start),b=minutes(end);if(a!=b&&(a<b?(t>=a&&t<b):(t>=a||t<b))){String[] endparts=end.split(":");at.set(Calendar.HOUR_OF_DAY,Integer.parseInt(endparts[0]));at.set(Calendar.MINUTE,Integer.parseInt(endparts[1]));if(at.getTimeInMillis()<=System.currentTimeMillis())at.add(Calendar.DAY_OF_YEAR,1);}}
  Intent intent=new Intent(c,ReminderReceiver.class).setAction("steadyday."+key);
  intent.putExtra("key",key);intent.putExtra("name",item.optString("name","Task"));intent.putExtra("mode",mode);intent.putExtra("hide",cfg.optBoolean("hide",true));intent.putExtra("lang",lang);intent.putExtra("habit",habit);
  PendingIntent pi=PendingIntent.getBroadcast(c,id(key),intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
  // Inexact alarms require no special exact-alarm permission; OS may delay them.
  am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at.getTimeInMillis(),pi);active.add(key);
 }
 static int minutes(String s){try{String[] p=s.split(":");return Integer.parseInt(p[0])*60+Integer.parseInt(p[1]);}catch(Exception e){return 0;}}
 static void test(Context c,String mode,String lang){ReminderReceiver.show(c,"test","SteadyDay",mode,false,lang);}
}
