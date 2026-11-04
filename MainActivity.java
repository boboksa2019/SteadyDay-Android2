package com.steadyday.app;

import android.Manifest;
import android.app.Activity;
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
  if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},23);
 }
 class Bridge {
  @JavascriptInterface public void sync(String config,String data,String language){runOnUiThread(()->ReminderScheduler.saveAndSchedule(MainActivity.this,config,data,language));}
  @JavascriptInterface public void requestPermission(){runOnUiThread(()->{if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},23);});}
  @JavascriptInterface public void test(String mode,String language){runOnUiThread(()->ReminderScheduler.test(MainActivity.this,mode,language));}
 }
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
}
