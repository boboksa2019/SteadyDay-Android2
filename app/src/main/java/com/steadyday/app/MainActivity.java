package com.steadyday.app;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.widget.Toast;
import android.content.Intent;
import android.provider.Settings;
import android.net.Uri;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
 WebView web;
 @Override public void onCreate(Bundle b){super.onCreate(b);
  web=new WebView(this);web.getSettings().setJavaScriptEnabled(true);web.getSettings().setDomStorageEnabled(true);
  web.getSettings().setAllowFileAccess(true);web.setWebViewClient(new WebViewClient());
  web.addJavascriptInterface(new Bridge(),"SteadyDayNative");setContentView(web);web.loadUrl("file:///android_asset/index.html");
  ReminderScheduler.schedule(this);
  if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},23);
 }
 class Bridge {
  @JavascriptInterface public void sync(String config,String data,String language){runOnUiThread(()->ReminderScheduler.saveAndSchedule(MainActivity.this,config,data,language));}
  @JavascriptInterface public void requestPermission(){runOnUiThread(()->{if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},23);});}
  @JavascriptInterface public void openNotificationSettings(){runOnUiThread(()->{Intent intent=new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);intent.putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName());try{startActivity(intent);}catch(Exception e){startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+getPackageName())));}});}
  @JavascriptInterface public void test(String mode,String language){runOnUiThread(()->{NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},23);Toast.makeText(MainActivity.this,"Allow notifications, then tap Test again",Toast.LENGTH_LONG).show();return;}if(!nm.areNotificationsEnabled()){Toast.makeText(MainActivity.this,"Ascend notifications are disabled in Android settings",Toast.LENGTH_LONG).show();return;}ReminderScheduler.test(MainActivity.this,mode,language);Toast.makeText(MainActivity.this,"Test notification sent to Android",Toast.LENGTH_SHORT).show();});}
 }
 @Override protected void onResume(){super.onResume();ReminderScheduler.schedule(this);}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}
