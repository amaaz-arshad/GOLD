// ToastModule.java

package com.gold;


import static androidx.core.app.ActivityCompat.startActivityForResult;

import android.Manifest;
import android.content.Intent;
import android.app.Activity;
import android.util.Log;
import android.widget.Toast;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import androidx.appcompat.app.AppCompatActivity;
import com.woosim.printer.WoosimBarcode;
import com.woosim.printer.WoosimCmd;
import com.woosim.printer.WoosimImage;
import com.woosim.printer.WoosimService;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.ref.WeakReference;
import java.util.Map;
import java.util.HashMap;

public class ToastModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  ToastModule(ReactApplicationContext context) {
    super(context);
    // reactContext = context;

  }

  @Override
  public String getName() {
    return "ToastExample";
  }

  @ReactMethod
  public void show(
  String vps, String vpe, String vpu, String vls, String vle, String vlu, 
  String tps,String tpe, String tpu, String tls, String tle, String tlu, 
  String cs, String ce, String cu,
  String tdlsno, String schdate, String custname, String custno,
  String primary, String productname, String vehicleno,
  String decantername, String drivername, String timein, String timeout,
  String odometerin, String odometerout, String check, String netweight,
  String deliveredvolume, String comments,
  String signbase64, Callback errorCallback,Callback successCallback
  ) {

    Activity activity = getCurrentActivity();
    //DeviceListActivity.class
    //PrintListActivity.

    Intent intent;
    int permissionCheck;
     int PERMISSION_DEVICE_SCAN_SECURE = 11;
   final int REQUEST_CONNECT_DEVICE_SECURE = 1;
    permissionCheck = ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION);
    if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
      // Launch the DeviceListActivity to see devices and do scan
     intent = new Intent(activity, DeviceListActivity.class);
      intent.putExtra("tdlsno", tdlsno);
      intent.putExtra("scheduledate", schdate);
      intent.putExtra("customername", custname);
      intent.putExtra("customerno",custno );
      intent.putExtra("primaryproduct", primary);
      intent.putExtra("productname", productname);
      intent.putExtra("vehicleno", vehicleno);
      intent.putExtra("decantername", decantername);
      intent.putExtra("drivername", drivername);
      intent.putExtra("timein", timein);
      intent.putExtra("timeout", timeout);
      intent.putExtra("odometerin", odometerin);
      intent.putExtra("odometerout", odometerout);
      intent.putExtra("check", check);
      intent.putExtra("netweight", netweight);
      intent.putExtra("deliveredvolume", deliveredvolume);
      intent.putExtra("comments", comments);
      intent.putExtra("viePressStart", vps);
      intent.putExtra("viePressEnd", vpe);
      intent.putExtra("viePressUnit", vpu);
      intent.putExtra("vieLevelStart", vls);
      intent.putExtra("vieLevelEnd", vle);
      intent.putExtra("vieLevelUnit", vlu);
      intent.putExtra("tankerPressStart", tps);
      intent.putExtra("tankerPressEnd", tpe);
      intent.putExtra("tankerPressUnit", tpu);
      intent.putExtra("tankerLevelStart", tls);
      intent.putExtra("tankerLevelEnd", tle);
      intent.putExtra("tankerLevelUnit", tlu);
      intent.putExtra("startContent", cs);
      intent.putExtra("endContent", ce);
      intent.putExtra("contentUnit", cu);
      intent.putExtra("sign", signbase64);
      //  startActivityForResult(intent, REQUEST_CONNECT_DEVICE_SECURE);

        activity.startActivity(intent);
    } else {
      ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_DEVICE_SCAN_SECURE);
    }

    Log.d("base64", signbase64);
    // startActivityForResult(intent, 2);
    // Intent intent = new Intent(this, AnotherActivity.class);
  //  activity.startActivity(intent);
    // public void show(String msg) {
    // System.out.println("msg: " + msg);
    // successCallback.invoke("hello from java into react native");
    // Toast.makeText(getReactApplicationContext(), message, duration).show();
  }

}