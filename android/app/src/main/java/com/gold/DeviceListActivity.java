
package com.gold;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.gold.R;
import com.woosim.printer.WoosimCmd;

import com.woosim.printer.WoosimBarcode;
import com.woosim.printer.WoosimCmd;
import com.woosim.printer.WoosimImage;
import com.woosim.printer.WoosimService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.lang.reflect.Array;
import java.util.Set;

/**
 * This Activity appears as a dialog. It lists any paired devices and
 * devices detected in the area after discovery. When a device is chosen
 * by the user, the MAC address of the device is sent back to the parent
 * Activity in the result Intent.
 */
public class DeviceListActivity extends Activity {
    // Debugging
    private static final String TAG = "DeviceListActivity";
    private static final boolean D = true;

    // Return Intent extra
    public static String EXTRA_DEVICE_ADDRESS = "device_address";

    // Member fields
    private BluetoothAdapter mBtAdapter;
    private ArrayAdapter<String> mNewDevicesArrayAdapter;

    public static final int MESSAGE_DEVICE_NAME = 1;
    public static final int MESSAGE_TOAST = 2;
    public static final int MESSAGE_READ = 3;

    public static final int REQUEST_CONNECT_DEVICE_SECURE = 1;
    public static final int REQUEST_CONNECT_DEVICE_INSECURE = 2;

    public static final int REQUEST_ENABLE_BT = 3;
    private BluetoothAdapter mBluetoothAdapter = null;
    private boolean mEmphasis = false;
    private boolean mUnderline = false;
    private int mCharsize = 1;
    private int mJustification = WoosimCmd.ALIGN_LEFT;
    private BluetoothPrintService mPrintService = null;
    private WoosimService mWoosim = null;

    public static final String DEVICE_NAME = "device_name";
    public static final String TOAST = "toast";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Setup the window
        setContentView(R.layout.device_list);
        // Set result CANCELED in case the user backs out
        setResult(Activity.RESULT_CANCELED);
        // Initialize the button to perform device discovery
        Button scanButton = findViewById(R.id.button_scan);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR) {
            mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        }

        scanButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                doDiscovery();
                v.setVisibility(View.GONE);
            }
        });

        // Initialize array adapters. One for already paired devices and
        // one for newly discovered devices
        ArrayAdapter<String> pairedDevicesArrayAdapter = new ArrayAdapter<>(this, R.layout.device_name);
        mNewDevicesArrayAdapter = new ArrayAdapter<>(this, R.layout.device_name);

        // Find and set up the ListView for paired devices
        ListView pairedListView = findViewById(R.id.paired_devices);
        pairedListView.setAdapter(pairedDevicesArrayAdapter);
        pairedListView.setOnItemClickListener(mDeviceClickListener);

        // Find and set up the ListView for newly discovered devices
        ListView newDevicesListView = findViewById(R.id.new_devices);
        newDevicesListView.setAdapter(mNewDevicesArrayAdapter);
        newDevicesListView.setOnItemClickListener(mDeviceClickListener);

        // Register for broadcasts when a device is discovered
        IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
        this.registerReceiver(mReceiver, filter);

        // Register for broadcasts when discovery has finished
        filter = new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        this.registerReceiver(mReceiver, filter);

        // Get the local Bluetooth adapter
        mBtAdapter = BluetoothAdapter.getDefaultAdapter();

        // Get a set of currently paired devices
        Set<BluetoothDevice> pairedDevices = mBtAdapter.getBondedDevices();

        // If there are paired devices, add each one to the ArrayAdapter
        if (pairedDevices.size() > 0) {
            findViewById(R.id.title_paired_devices).setVisibility(View.VISIBLE);
            for (BluetoothDevice device : pairedDevices) {
                pairedDevicesArrayAdapter.add(device.getName() + "\n" + device.getAddress());
            }
        } else {
            String noDevices = getResources().getText(R.string.none_paired).toString();
            pairedDevicesArrayAdapter.add(noDevices);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        // Make sure we're not doing discovery anymore
        if (mBtAdapter != null) {
            mBtAdapter.cancelDiscovery();
        }
        // Unregister broadcast listeners
        this.unregisterReceiver(mReceiver);
    }

    /**
     * Start device discover with the BluetoothAdapter
     */
    private void doDiscovery() {
        if (D) Log.d(TAG, "doDiscovery()");

        // Indicate scanning in the title
        setTitle(R.string.scanning);

        // Turn on sub-title for new devices
        findViewById(R.id.title_new_devices).setVisibility(View.VISIBLE);

        // If we're already discovering, stop it
        if (mBtAdapter.isDiscovering()) {
            mBtAdapter.cancelDiscovery();
        }

        // Request discover from BluetoothAdapter
        mBtAdapter.startDiscovery();
    }

    // The on-click listener for all devices in the ListViews
    private OnItemClickListener mDeviceClickListener = new OnItemClickListener() {
        public void onItemClick(AdapterView<?> av, View v, int arg2, long arg3) {
            // Cancel discovery because it's costly and we're about to connect
            mBtAdapter.cancelDiscovery();

            // Get the device MAC address, which is the last 17 chars in the View
            String info = ((TextView) v).getText().toString();
            String address = info.substring(info.length() - 17);
            // Create the result Intent and include the MAC address
            Intent intent = new Intent();
           //connectDevice(intent,true);

            intent.putExtra(EXTRA_DEVICE_ADDRESS, address);
            intent.putExtra("tdlsno", getIntent().getStringExtra("tdlsno"));
            intent.putExtra("scheduledate", getIntent().getStringExtra("scheduledate"));
            intent.putExtra("customername", getIntent().getStringExtra("customername"));
            intent.putExtra("customerno",getIntent().getStringExtra("customerno") );
            intent.putExtra("primaryproduct", getIntent().getStringExtra("primaryproduct"));
            intent.putExtra("productname", getIntent().getStringExtra("productname"));
            intent.putExtra("vehicleno", getIntent().getStringExtra("vehicleno"));
            intent.putExtra("decantername", getIntent().getStringExtra("decantername"));
            intent.putExtra("drivername", getIntent().getStringExtra("drivername"));
            intent.putExtra("timein", getIntent().getStringExtra("timein"));
            intent.putExtra("timeout", getIntent().getStringExtra("timeout"));
            intent.putExtra("odometerin",getIntent().getStringExtra("odometerin"));
            intent.putExtra("odometerout",getIntent().getStringExtra("odometerout"));
            intent.putExtra("check", getIntent().getStringExtra("check"));
            intent.putExtra("netweight", getIntent().getStringExtra("netweight"));
            intent.putExtra("deliveredvolume",getIntent().getStringExtra("deliveredvolume"));
            intent.putExtra("comments", getIntent().getStringExtra("comments"));
            intent.putExtra("viePressStart", getIntent().getStringExtra("viePressStart"));
            intent.putExtra("viePressEnd", getIntent().getStringExtra("viePressEnd"));
            intent.putExtra("viePressUnit", getIntent().getStringExtra("viePressUnit"));
            intent.putExtra("vieLevelStart", getIntent().getStringExtra("vieLevelStart"));
            intent.putExtra("vieLevelEnd", getIntent().getStringExtra("vieLevelEnd"));
            intent.putExtra("vieLevelUnit", getIntent().getStringExtra("vieLevelUnit"));
            intent.putExtra("tankerPressStart", getIntent().getStringExtra("tankerPressStart"));
            intent.putExtra("tankerPressEnd", getIntent().getStringExtra("tankerPressEnd"));
            intent.putExtra("tankerPressUnit", getIntent().getStringExtra("tankerPressUnit"));
            intent.putExtra("tankerLevelStart", getIntent().getStringExtra("tankerLevelStart"));
            intent.putExtra("tankerLevelEnd", getIntent().getStringExtra("tankerLevelEnd"));
            intent.putExtra("tankerLevelUnit",getIntent().getStringExtra("tankerLevelUnit"));
            intent.putExtra("startContent",getIntent().getStringExtra("startContent"));
            intent.putExtra("endContent", getIntent().getStringExtra("endContent"));
            intent.putExtra("contentUnit", getIntent().getStringExtra("contentUnit"));
            intent.putExtra("sign", getIntent().getStringExtra("sign"));
            // Set result and finish this Activity
            setResult(Activity.RESULT_OK, intent);
            Log.d("Address",address);
            connectDevice(intent,true);
            //startActivity(intent);
            finish();
        }
    };

    private void sendData(byte[] data) {
        // Check that we're actually connected before trying printing
        if (mPrintService.getState() != BluetoothPrintService.STATE_CONNECTED) {
            Toast.makeText(this, R.string.not_connected, Toast.LENGTH_SHORT).show();
            return;
        }
        // Check that there's actually something to send
        if (data.length > 0)
            mPrintService.write(data);

    }

    /**
     * On click function for sample print button.
     */
    public void printReceipt() {
        // InputStream inStream = getResources().openRawResource(R.raw.receipt2);

        String head = "Pakistan Oxygen Limited \n";
        InputStream inStream = new ByteArrayInputStream(head.getBytes());

        String head1 =
                "\nCall on: +92.21.111-262725" + "\n"+
                        "Website: www.pakoxygen.com" + "\n"+
                        "------------------------------------------------" + "\n";
        InputStream inStream1 = new ByteArrayInputStream(head1.getBytes());

        String subhead = "DELIVERY NOTE \n";
        InputStream inStream4 = new ByteArrayInputStream(subhead.getBytes());

        String vieData="VIE Data";
        InputStream inStream3 = new ByteArrayInputStream(vieData.getBytes());

        String vieStart="Start";
        InputStream inStream8 = new ByteArrayInputStream(vieStart.getBytes());

        String vieEnd="End";
        InputStream inStream5 = new ByteArrayInputStream(vieEnd.getBytes());

        String vieUnit="Unit\n";
        InputStream inStream6 = new ByteArrayInputStream(vieUnit.getBytes());

        String line=
                "------------------------------------------------" + "\n";
        InputStream inStream7 = new ByteArrayInputStream(line.getBytes());

        String pressure="Pressure";
        InputStream inStream9 = new ByteArrayInputStream(pressure.getBytes());

        String viePressStart = getIntent().getStringExtra("viePressStart");
        InputStream inStream10 = new ByteArrayInputStream(viePressStart.getBytes());

        String viePressEnd = getIntent().getStringExtra("viePressEnd");
        InputStream inStream11 = new ByteArrayInputStream(viePressEnd.getBytes());

        String viePressUnit = getIntent().getStringExtra("viePressUnit");
        InputStream inStream12 = new ByteArrayInputStream(viePressUnit.getBytes());

        String vieLevelStart = getIntent().getStringExtra("vieLevelStart");
        InputStream inStream13 = new ByteArrayInputStream(vieLevelStart.getBytes());

        String vieLevelEnd = getIntent().getStringExtra("vieLevelEnd");
        InputStream inStream14 = new ByteArrayInputStream(vieLevelEnd.getBytes());

        String vieLevelUnit = getIntent().getStringExtra("vieLevelUnit");
        InputStream inStream15 = new ByteArrayInputStream(vieLevelUnit.getBytes());

        String level="Level";
        InputStream inStream16 = new ByteArrayInputStream(level.getBytes());

        String tankerData="Tanker Data";
        InputStream inStream17 = new ByteArrayInputStream(tankerData.getBytes());

        String tankerStart="Start";
        InputStream inStream18 = new ByteArrayInputStream(tankerStart.getBytes());

        String tankerEnd="End";
        InputStream inStream19 = new ByteArrayInputStream(tankerEnd.getBytes());

        String tankerUnit="Unit\n";
        InputStream inStream20 = new ByteArrayInputStream(tankerUnit.getBytes());

        pressure=
                "------------------------------------------------" + "\n"+
                        "Pressure";
        InputStream inStream21 = new ByteArrayInputStream(pressure.getBytes());

        String tankerPressStart = getIntent().getStringExtra("tankerPressStart");
        InputStream inStream22 = new ByteArrayInputStream(tankerPressStart.getBytes());

        String tankerPressEnd = getIntent().getStringExtra("tankerPressEnd");
        InputStream inStream23 = new ByteArrayInputStream(tankerPressEnd.getBytes());

        String tankerPressUnit = getIntent().getStringExtra("tankerPressUnit");
        InputStream inStream24 = new ByteArrayInputStream(tankerPressUnit.getBytes());

        level="Level";
        InputStream inStream25 = new ByteArrayInputStream(level.getBytes());

        String tankerLevelStart = getIntent().getStringExtra("tankerLevelStart");
        InputStream inStream26 = new ByteArrayInputStream(tankerLevelStart.getBytes());

        String tankerLevelEnd = getIntent().getStringExtra("tankerLevelEnd");
        InputStream inStream27 = new ByteArrayInputStream(tankerLevelEnd.getBytes());

        String tankerLevelUnit = getIntent().getStringExtra("tankerLevelUnit");
        InputStream inStream28 = new ByteArrayInputStream(tankerLevelUnit.getBytes());

        String Content="Content";
        InputStream inStream29 = new ByteArrayInputStream(Content.getBytes());

        String startContent = getIntent().getStringExtra("startContent");
        InputStream inStream30 = new ByteArrayInputStream(startContent.getBytes());

        String endContent = getIntent().getStringExtra("endContent");
        InputStream inStream31 = new ByteArrayInputStream(endContent.getBytes());

        String contentUnit = getIntent().getStringExtra("contentUnit");
        InputStream inStream32 = new ByteArrayInputStream(contentUnit.getBytes());

        String endMsg =
                "\n------------------------------------------------" + "\n" +
                        "**If you want to keep a permanent record, please make a photocopy of this Delivery Note**" +
                        "\n\n\n\n\n\n";
        InputStream inStream34 = new ByteArrayInputStream(endMsg.getBytes());

        String tdlsstring=
                "------------------------------------------------" + "\n" + "TDLS No:";
        InputStream inStream35 = new ByteArrayInputStream(tdlsstring.getBytes());

        String tdlsno = getIntent().getStringExtra("tdlsno");
        InputStream inStream36 = new ByteArrayInputStream(tdlsno.getBytes());

        InputStream inStream37 = new ByteArrayInputStream("Date:".getBytes());

        String scheduledate= getIntent().getStringExtra("scheduledate");
        InputStream inStream38 = new ByteArrayInputStream(scheduledate.getBytes());

        InputStream inStream39 = new ByteArrayInputStream("Customer Code:".getBytes());

        String customerno = getIntent().getStringExtra("customerno");
        InputStream inStream40 = new ByteArrayInputStream(customerno.getBytes());

        InputStream inStream41 = new ByteArrayInputStream("Name:".getBytes());

        String customername = getIntent().getStringExtra("customername");
        InputStream inStream42 = new ByteArrayInputStream(customername.getBytes());

        InputStream inStream43 = new ByteArrayInputStream("Product Code:".getBytes());

        String primaryproduct = getIntent().getStringExtra("primaryproduct");
        InputStream inStream44 = new ByteArrayInputStream(primaryproduct.getBytes());

        InputStream inStream45 = new ByteArrayInputStream("Description:".getBytes());

        String productname = getIntent().getStringExtra("productname");
        InputStream inStream46 = new ByteArrayInputStream(productname.getBytes());

        InputStream inStream47 = new ByteArrayInputStream("Tanker No:".getBytes());

        String vehicleno = getIntent().getStringExtra("vehicleno");
        InputStream inStream48 = new ByteArrayInputStream(vehicleno.getBytes());

        InputStream inStream49 = new ByteArrayInputStream("Decanter Name:".getBytes());

        String decantername = getIntent().getStringExtra("decantername");
        InputStream inStream50 = new ByteArrayInputStream(decantername.getBytes());

        InputStream inStream51 = new ByteArrayInputStream("Driver Name:".getBytes());

        String drivername = getIntent().getStringExtra("drivername");
        InputStream inStream52 = new ByteArrayInputStream(drivername.getBytes());

        InputStream inStream53 = new ByteArrayInputStream("Date & Time In:".getBytes());

        String timein = getIntent().getStringExtra("timein");
        InputStream inStream54 = new ByteArrayInputStream(timein.getBytes());

        InputStream inStream55 = new ByteArrayInputStream("Odometer In:".getBytes());

        String odometerin = getIntent().getStringExtra("odometerin");
        InputStream inStream56 = new ByteArrayInputStream(odometerin.getBytes());

        InputStream inStream57 = new ByteArrayInputStream("Date & Time Out:".getBytes());

        String timeout = getIntent().getStringExtra("timeout");
        InputStream inStream58 = new ByteArrayInputStream(timeout.getBytes());

        InputStream inStream59 = new ByteArrayInputStream("Odometer Out:".getBytes());

        String odometerout = getIntent().getStringExtra("odometerout");
        InputStream inStream60 = new ByteArrayInputStream(odometerout.getBytes());

        String check = getIntent().getStringExtra("check");
        // InputStream inStream61 = new ByteArrayInputStream(check.getBytes());

        InputStream inStream62 = new ByteArrayInputStream("Net Weight:".getBytes());

        String netweight = getIntent().getStringExtra("netweight");
        InputStream inStream63 = new ByteArrayInputStream(netweight.getBytes());

        InputStream inStream64 = new ByteArrayInputStream("Delivered Volume:".getBytes());

        String deliveredvolume = getIntent().getStringExtra("deliveredvolume");
        InputStream inStream65 = new ByteArrayInputStream(deliveredvolume.getBytes());

        InputStream inStream67 = new ByteArrayInputStream("Comments:".getBytes());

        String comments = getIntent().getStringExtra("comments");
        InputStream inStream68 = new ByteArrayInputStream(comments.getBytes());

        InputStream inStream69 = new ByteArrayInputStream("Customer Signature:".getBytes());


        sendData(WoosimCmd.initPrinter());
        sendData(WoosimCmd.setCodeTable(2, 0, 0));

        try {
            byte[] data = new byte[inStream.available()];
            while (inStream.read(data) != -1)
            {

                sendData(WoosimCmd.setTextStyle(true, false, false, 2, 2));
                sendData(WoosimCmd.setTextAlign(WoosimCmd.ALIGN_CENTER));
                sendData(data);
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(WoosimCmd.setTextAlign(mJustification));
            }

            data = new byte[inStream1.available()];
            while (inStream1.read(data) != -1)
            {
                sendData(WoosimCmd.setTextAlign(WoosimCmd.ALIGN_CENTER));
                sendData(data);
                sendData(WoosimCmd.setTextAlign(mJustification));
            }

            data = new byte[inStream4.available()];
            while (inStream4.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(WoosimCmd.setTextAlign(WoosimCmd.ALIGN_CENTER));
                sendData(data);
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(WoosimCmd.setTextAlign(mJustification));

            }

            // data = new byte[inStream2.available()];
            // while (inStream2.read(data) != -1)
            // {
            //     sendData(data);
            // }

            data = new byte[inStream35.available()];
            while (inStream35.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream36.available()];
            while (inStream36.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream37.available()];
            while (inStream37.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream38.available()];
            while (inStream38.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream39.available()];
            while (inStream39.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream40.available()];
            while (inStream40.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream41.available()];
            while (inStream41.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream42.available()];
            while (inStream42.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream43.available()];
            while (inStream43.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream44.available()];
            while (inStream44.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream45.available()];
            while (inStream45.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream46.available()];
            while (inStream46.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream47.available()];
            while (inStream47.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream48.available()];
            while (inStream48.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream49.available()];
            while (inStream49.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream50.available()];
            while (inStream50.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream51.available()];
            while (inStream51.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream52.available()];
            while (inStream52.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream53.available()];
            while (inStream53.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream54.available()];
            while (inStream54.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream55.available()];
            while (inStream55.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream56.available()];
            while (inStream56.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream57.available()];
            while (inStream57.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream58.available()];
            while (inStream58.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream59.available()];
            while (inStream59.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream60.available()];
            while (inStream60.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            // data = new byte[inStream61.available()];
            // while (inStream61.read(data) != -1)
            // {
            //     sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
            //     sendData(data);
            //     sendData(WoosimCmd.moveAbsPosition(225));
            // }
            // data = new byte[inStream62.available()];
            // while (inStream62.read(data) != -1)
            // {
            //     sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
            //     sendData(data);
            // }


            // old ones
            data = new byte[inStream3.available()];
            while (inStream3.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream8.available()];
            while (inStream8.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream5.available()];
            while (inStream5.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream6.available()];
            while (inStream6.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
            }

            data = new byte[inStream7.available()];
            while (inStream7.read(data) != -1)
            {
                sendData(data);
            }

            data = new byte[inStream9.available()];
            while (inStream9.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream10.available()];
            while (inStream10.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream11.available()];
            while (inStream11.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream12.available()];
            while (inStream12.read(data) != -1)
            {
                sendData(data);
            }

            data = new byte[inStream16.available()];
            while (inStream16.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream13.available()];
            while (inStream13.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream14.available()];
            while (inStream14.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream15.available()];
            while (inStream15.read(data) != -1)
            {
                sendData(data);
            }

            data = new byte[inStream17.available()];
            while (inStream17.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream18.available()];
            while (inStream18.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream19.available()];
            while (inStream19.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream20.available()];
            while (inStream20.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
            }

            data = new byte[inStream21.available()];
            while (inStream21.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream22.available()];
            while (inStream22.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream23.available()];
            while (inStream23.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream24.available()];
            while (inStream24.read(data) != -1)
            {
                sendData(data);
            }

            data = new byte[inStream25.available()];
            while (inStream25.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream26.available()];
            while (inStream26.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream27.available()];
            while (inStream27.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream28.available()];
            while (inStream28.read(data) != -1)
            {
                sendData(data);
            }

            data = new byte[inStream29.available()];
            while (inStream29.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }

            data = new byte[inStream30.available()];
            while (inStream30.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(360));
            }

            data = new byte[inStream31.available()];
            while (inStream31.read(data) != -1)
            {
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(490));
            }

            data = new byte[inStream32.available()];
            while (inStream32.read(data) != -1)
            {
                sendData(data);
            }

            // data = new byte[inStream33.available()];
            // while (inStream33.read(data) != -1)
            // {
            //     sendData(data);
            // }
            // if(check=="2"){
            data = new byte[inStream62.available()];
            while (inStream62.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream63.available()];
            while (inStream63.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }
            // }

            data = new byte[inStream64.available()];
            while (inStream64.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream65.available()];
            while (inStream65.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream67.available()];
            while (inStream67.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
                sendData(WoosimCmd.moveAbsPosition(225));
            }
            data = new byte[inStream68.available()];
            while (inStream68.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(false, false, false, 1, 1));
                sendData(data);
            }

            data = new byte[inStream69.available()];
            while (inStream69.read(data) != -1)
            {
                sendData(WoosimCmd.setTextStyle(true, false, false, 1, 1));
                sendData(data);
            }

            printImage();

            data = new byte[inStream34.available()];
            while (inStream34.read(data) != -1)
            {
                sendData(data);
            }

        } catch (IOException e) {
            Log.e(TAG, "sample 2inch receipt print fail.", e);
        } finally {
            try {
                inStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Log.d("activity Result",requestCode+"");


        if (D) Log.d(TAG, "onActivityResult " + resultCode);
        switch (requestCode) {
            case REQUEST_CONNECT_DEVICE_SECURE:
                // When DeviceListActivity returns with a device to connect
                if (resultCode == Activity.RESULT_OK) {
                    connectDevice(data, true);
                }
                break;
            case REQUEST_CONNECT_DEVICE_INSECURE:
                // When DeviceListActivity returns with a device to connect
                if (resultCode == Activity.RESULT_OK) {
                    connectDevice(data, false);
                }
                break;
            case REQUEST_ENABLE_BT:
                // When the request to enable Bluetooth returns
                if (resultCode == Activity.RESULT_OK) {
                    // Bluetooth is now enabled, so set up a print
                    setupPrint();
                } else {
                    // User did not enable Bluetooth or an error occurred
                    if (D) Log.d(TAG, "BT not enabled");
                    Toast.makeText(this, R.string.bt_not_enabled_leaving, Toast.LENGTH_SHORT).show();
                    finish();
                }
        }
    }

    private void handleMessage(Message msg) {
        switch (msg.what) {
            case MESSAGE_DEVICE_NAME:
                // save the connected device's name
                String mConnectedDeviceName = msg.getData().getString(DEVICE_NAME);
                Toast.makeText(getApplicationContext(), "Connected to " + mConnectedDeviceName, Toast.LENGTH_SHORT).show();
                //redrawMenu();

                printReceipt();

                mPrintService.start();
                break;
            case MESSAGE_TOAST:
               // Toast.makeText(getApplicationContext(), msg.getData().getInt(TOAST), Toast.LENGTH_SHORT).show();
                break;
            case MESSAGE_READ:
                mWoosim.processRcvData((byte[])msg.obj, msg.arg1);
                break;
            case WoosimService.MESSAGE_PRINTER:
                break;
        }
    }
    private static class MyHandler extends Handler {
        private final WeakReference<DeviceListActivity> mActivity;

        MyHandler(DeviceListActivity activity) {
            mActivity = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(Message msg) {
            DeviceListActivity activity = mActivity.get();
            if (activity != null) {
                activity.handleMessage(msg);
            }
        }
    }
    private final MyHandler mHandler = new MyHandler(this);
    private void setupPrint() {


        // Initialize the BluetoothPrintService to perform bluetooth connections
        mPrintService = new BluetoothPrintService(mHandler);
        mWoosim = new WoosimService(mHandler);
    }

    private void connectDevice(Intent data, boolean secure) {
        String address = null;
        // Get the device MAC address
        if (data.getExtras() != null)
            address = data.getExtras().getString(DeviceListActivity.EXTRA_DEVICE_ADDRESS);
        // Get the BLuetoothDevice object
        BluetoothDevice device = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.ECLAIR) {
            Log.d("address1",address);
            device = mBluetoothAdapter.getRemoteDevice(address);

        }
        mPrintService = new BluetoothPrintService(mHandler);
        mWoosim = new WoosimService(mHandler);
        // Attempt to connect to the device

        mPrintService.connect(device, secure);
        Log.d("mprintSerice",mPrintService.getState()+"");

    }
    public void printImage() {
        BitmapFactory.Options options = new BitmapFactory.Options();

        String signimage = getIntent().getStringExtra("sign");
        //String base64Image = signimage.split(",")[1];
        //   imageBytes = Base64.decode(imageString, Base64.DEFAULT);
        //   Bitmap decodedImage = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.DONUT) {
            options.inScaled = false;
        }
        //   String base64String = ImageUtil.convert(bitmap);

        Bitmap bmp = BitmapFactory.decodeResource(getResources(), R.drawable.logo, options);
        System.out.println("sign image"+signimage);
        //signimage=getEncoded64ImageStringFromBitmap(bmp);
        Log.e("error image",signimage);
        byte[] decodedString = Base64.decode(signimage, Base64.DEFAULT);
        bmp= BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

        if (bmp == null) {
            Log.e(TAG, "resource decoding is failed");
            return;
        }
        byte[] data = WoosimImage.drawBitmap(0, 0, bmp);
        bmp.recycle();

        sendData(WoosimCmd.setPageMode());
        sendData(data);
        sendData(WoosimCmd.PM_setStdMode());
    }
    // The BroadcastReceiver that listens for discovered devices and
    // changes the title when discovery is finished
    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            Log.d("connection1",action);
            // When discovery finds a device
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {

                Log.d("connection",action);

                // Get the BluetoothDevice object from the Intent
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
               // connectDevice(intent, true);
                // If it's already paired, skip it, because it's been listed already
                if (device.getBondState() != BluetoothDevice.BOND_BONDED) {
                    mNewDevicesArrayAdapter.add(device.getName() + "\n" + device.getAddress());
                }
                // When discovery is finished, change the Activity title
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                setTitle(R.string.select_device);
                if (mNewDevicesArrayAdapter.getCount() == 0) {
                    String noDevices = getResources().getText(R.string.none_found).toString();
                    mNewDevicesArrayAdapter.add(noDevices);
                }
            }

        }
    };
}
