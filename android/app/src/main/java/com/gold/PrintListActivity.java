
package com.gold;
import android.app.Activity;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Base64;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.woosim.printer.WoosimBarcode;
import com.woosim.printer.WoosimCmd;
import com.woosim.printer.WoosimImage;
import com.woosim.printer.WoosimService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.ref.WeakReference;

public class PrintListActivity extends AppCompatActivity {
    // Debugging
    private static final String TAG = "MainActivity";
    private static final boolean D = true;

    // Message types sent from the BluetoothPrintService Handler
    public static final int MESSAGE_DEVICE_NAME = 1;
    public static final int MESSAGE_TOAST = 2;
    public static final int MESSAGE_READ = 3;

    // Key names received from the BluetoothPrintService Handler
    public static final String DEVICE_NAME = "device_name";
    public static final String TOAST = "toast";

    // Intent request codes
    private static final int REQUEST_CONNECT_DEVICE_SECURE = 1;
    private static final int REQUEST_CONNECT_DEVICE_INSECURE = 2;
    private static final int REQUEST_ENABLE_BT = 3;

    private static final int PERMISSION_DEVICE_SCAN_SECURE = 11;
    private static final int PERMISSION_DEVICE_SCAN_INSECURE = 12;

    // Layout Views
    private boolean mEmphasis = false;
    private boolean mUnderline = false;
    private int mCharsize = 1;
    private int mJustification = WoosimCmd.ALIGN_LEFT;
    private TextView mTrack1View;
    private TextView mTrack2View;
    private TextView mTrack3View;
    private Menu mMenu = null;
private Button buttonscan;
    // Local Bluetooth adapter
    private BluetoothAdapter mBluetoothAdapter = null;
    // Member object for the print services
    private BluetoothPrintService mPrintService = null;
    private WoosimService mWoosim = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        buttonscan=findViewById(R.id.btn_connect);
        buttonscan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent serverIntent;
                int permissionCheck;
                permissionCheck = ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION);
                if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
                    // Launch the DeviceListActivity to see devices and do scan
                    serverIntent = new Intent(getApplicationContext(), DeviceListActivity.class);
                    startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE_SECURE);
                } else {
                    ActivityCompat.requestPermissions(PrintListActivity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_DEVICE_SCAN_SECURE);
                }
            }
        });
        if(D) Log.i(TAG, "+++ ON CREATE +++");
        // Get local Bluetooth adapter
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR) {
            mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        }

        // If the adapter is null, then Bluetooth is not supported
        if (mBluetoothAdapter == null) {
            Toast.makeText(this, R.string.toast_bt_na, Toast.LENGTH_LONG).show();
            finish();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if(D) Log.i(TAG, "++ ON START ++");

        // If BT is not on, request that it be enabled.
        // setupPrint() will then be called during onActivityResult
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ECLAIR) {
            if (!mBluetoothAdapter.isEnabled()) {
                Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                startActivityForResult(enableIntent, REQUEST_ENABLE_BT);
                // Otherwise, setup the chat session
            } else {
                if (mPrintService == null)  setupPrint();
            }
        }
    }

    @Override
    public synchronized void onResume() {
        super.onResume();
        if(D) Log.i(TAG, "+ ON RESUME +");

        // Performing this check in onResume() covers the case in which BT was
        // not enabled during onStart(), so we were paused to enable it...
        // onResume() will be called when ACTION_REQUEST_ENABLE activity returns.
        if (mPrintService != null) {
            // Only if the state is STATE_NONE, do we know that we haven't started already
            if (mPrintService.getState() == BluetoothPrintService.STATE_NONE) {
                // Start the Bluetooth print services
                mPrintService.start();
            }
        }
    }

    private void setupPrint() {
        Spinner spinner = findViewById(R.id.spn_charsize);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this, R.array.char_size_array, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        if (spinner != null) {
            spinner.setAdapter(adapter);
            spinner.setOnItemSelectedListener(
                    new OnItemSelectedListener() {
                        public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                            if (position == 1) mCharsize = 2;
                            else if (position == 2) mCharsize = 3;
                            else if (position == 3) mCharsize = 4;
                            else if (position == 4) mCharsize = 5;
                            else if (position == 5) mCharsize = 6;
                            else if (position == 6) mCharsize = 7;
                            else if (position == 7) mCharsize = 8;
                            else mCharsize = 1;
                        }
                        public void onNothingSelected(AdapterView<?> parent) { }
                    }
            );
        }

        mTrack1View = findViewById(R.id.view_track1);
        mTrack2View = findViewById(R.id.view_track2);
        mTrack3View = findViewById(R.id.view_track3);

        // Initialize the BluetoothPrintService to perform bluetooth connections
        mPrintService = new BluetoothPrintService(mHandler);
        mWoosim = new WoosimService(mHandler);
    }

    // The Handler that gets information back from the BluetoothPrintService
    private final MyHandler mHandler = new MyHandler(this);

    private static class MyHandler extends Handler {
        private final WeakReference<PrintListActivity> mActivity;

        MyHandler(PrintListActivity activity) {
            mActivity = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(Message msg) {
            PrintListActivity activity = mActivity.get();
            if (activity != null) {
                activity.handleMessage(msg);
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
                break;
            case MESSAGE_TOAST:
                Toast.makeText(getApplicationContext(), msg.getData().getInt(TOAST), Toast.LENGTH_SHORT).show();
                break;
            case MESSAGE_READ:
                mWoosim.processRcvData((byte[])msg.obj, msg.arg1);
                break;
            case WoosimService.MESSAGE_PRINTER:
                if (msg.arg1 == WoosimService.MSR) {
                    if (msg.arg2 == 0) {
                        Toast.makeText(getApplicationContext(), "MSR reading failure", Toast.LENGTH_SHORT).show();
                    } else {
                        byte[][] track = (byte[][]) msg.obj;
                        if (track[0] != null) {
                            String str = new String(track[0]);
                            mTrack1View.setText(str);
                        }
                        if (track[1] != null) {
                            String str = new String(track[1]);
                            mTrack2View.setText(str);
                        }
                        if (track[2] != null) {
                            String str = new String(track[2]);
                            mTrack3View.setText(str);
                        }
                    }
                }
                break;
        }
    }

    @Override
    public synchronized void onPause() {
        super.onPause();
        if(D) Log.i(TAG, "- ON PAUSE -");
    }

    @Override
    public void onStop() {
        super.onStop();
        if(D) Log.i(TAG, "-- ON STOP --");
    }

    @Override
    public void onDestroy() {
        if(D) Log.i(TAG, "--- ON DESTROY ---");
        // Stop the Bluetooth print services
        if (mPrintService != null) mPrintService.stop();
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        menu.findItem(R.id.disconnect).setVisible(false);
        mMenu = menu;
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent serverIntent;
        int permissionCheck;

        switch (item.getItemId()) {
            case R.id.secure_connect_scan:
                permissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION);
                if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
                    // Launch the DeviceListActivity to see devices and do scan
                    serverIntent = new Intent(this, DeviceListActivity.class);
                    startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE_SECURE);
                } else {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_DEVICE_SCAN_SECURE);
                }
                return true;
            case R.id.insecure_connect_scan:
                permissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION);
                if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
                    // Launch the DeviceListActivity to see devices and do scan
                    serverIntent = new Intent(this, DeviceListActivity.class);
                    startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE_INSECURE);
                } else {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_DEVICE_SCAN_INSECURE);
                }
                return true;
            case R.id.disconnect:
                // Close Bluetooth connection
                if (mPrintService != null)
                    mPrintService.start();
                redrawMenu();
                return true;
        }
        return false;
    }

    private void redrawMenu() {
        MenuItem itemSecureConnect = mMenu.findItem(R.id.secure_connect_scan);
        MenuItem itemInsecureConnect = mMenu.findItem(R.id.insecure_connect_scan);
        MenuItem itemDisconnect = mMenu.findItem(R.id.disconnect);

        // Context sensitive option menu
        if (mPrintService.getState() != BluetoothPrintService.STATE_CONNECTED) {
            if (!itemSecureConnect.isVisible()) itemSecureConnect.setVisible(true);
            if (!itemInsecureConnect.isVisible()) itemInsecureConnect.setVisible(true);
            if (itemDisconnect.isVisible()) itemDisconnect.setVisible(false);
        } else {
            if (itemSecureConnect.isVisible()) itemSecureConnect.setVisible(false);
            if (itemInsecureConnect.isVisible()) itemInsecureConnect.setVisible(false);
            if (!itemDisconnect.isVisible()) itemDisconnect.setVisible(true);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_DEVICE_SCAN_SECURE:
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Intent intent = new Intent(this, DeviceListActivity.class);
                    startActivityForResult(intent, REQUEST_CONNECT_DEVICE_SECURE);
                }
                break;
            case PERMISSION_DEVICE_SCAN_INSECURE:
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Intent intent = new Intent(this, DeviceListActivity.class);
                    startActivityForResult(intent, REQUEST_CONNECT_DEVICE_INSECURE);
                }
                break;
        }
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
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

    private void connectDevice(Intent data, boolean secure) {
        String address = null;
        // Get the device MAC address
        if (data.getExtras() != null)

            address = data.getExtras().getString(DeviceListActivity.EXTRA_DEVICE_ADDRESS);
        // Get the BLuetoothDevice object
        BluetoothDevice device = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.ECLAIR) {
            device = mBluetoothAdapter.getRemoteDevice(address);
        }
        // Attempt to connect to the device
        mPrintService.connect(device, secure);
    }

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
    public void printReceipt(View v) {
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

            printImage(v);

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

    public void printImage(View v) {
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


    public String getEncoded64ImageStringFromBitmap(Bitmap bitmap) {
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 70, stream);
        byte[] byteFormat = stream.toByteArray();

        // Get the Base64 string
        String imgString = Base64.encodeToString(byteFormat, Base64.NO_WRAP);

        return imgString;
    }


    public void printText(View v) throws IOException {
        EditText editText = findViewById(R.id.edit_text);
        String string = editText != null ? editText.getText().toString() : null;
        byte[] text = null;

        if (string == null)
            return;
        else {
            try {
                text = string.getBytes("US-ASCII");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(WoosimCmd.setTextStyle(mEmphasis, mUnderline, false, mCharsize, mCharsize));
        byteStream.write(WoosimCmd.setTextAlign(mJustification));
        if (text != null) byteStream.write(text);
        byteStream.write(WoosimCmd.printData());

        sendData(WoosimCmd.initPrinter());
        sendData(byteStream.toByteArray());
    }

    public void onCheckboxClicked(View v) {
        boolean checked = ((CheckBox) v).isChecked();
        switch(v.getId()) {
            case R.id.cbx_emphasis:
                mEmphasis = checked;
                break;
            case R.id.cbx_underline:
                mUnderline = checked;
                break;
        }
    }

    public void onRadioButtonClicked(View v) {
        boolean checked = ((RadioButton) v).isChecked();
        switch(v.getId()) {
            case R.id.rbtn_left:
                if (checked) mJustification = WoosimCmd.ALIGN_LEFT;
                break;
            case R.id.rbtn_center:
                if (checked) mJustification = WoosimCmd.ALIGN_CENTER;
                break;
            case R.id.rbtn_right:
                if (checked) mJustification = WoosimCmd.ALIGN_RIGHT;
                break;
        }
    }

    /**
     * On click function for barcode print button.
     */
    public void print1DBarcode(View v) throws IOException {
        final byte[] barcode =  {0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30};
        final byte[] barcode8 = {0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37};
        final byte[] barcodeUPCE = {0x30,0x36,0x35,0x31,0x30,0x30,0x30,0x30,0x34,0x33,0x32,0x37};
        final byte[] cmd_print = WoosimCmd.printData();
        final String title1 = "UPC-A Barcode\r\n";
        byte[] UPCA = WoosimBarcode.createBarcode(WoosimBarcode.UPC_A, 2, 60, true, barcode);
        final String title2 = "UPC-E Barcode\r\n";
        byte[] UPCE = WoosimBarcode.createBarcode(WoosimBarcode.UPC_E, 2, 60, true, barcodeUPCE);
        final String title3 = "EAN13 Barcode\r\n";
        byte[] EAN13 = WoosimBarcode.createBarcode(WoosimBarcode.EAN13, 2, 60, true, barcodeUPCE);
        final String title4 = "EAN8 Barcode\r\n";
        byte[] EAN8 = WoosimBarcode.createBarcode(WoosimBarcode.EAN8, 2, 60, true, barcode8);
        final String title5 = "CODE39 Barcode\r\n";
        byte[] CODE39 = WoosimBarcode.createBarcode(WoosimBarcode.CODE39, 2, 60, true, barcode);
        final String title6 = "ITF Barcode\r\n";
        byte[] ITF = WoosimBarcode.createBarcode(WoosimBarcode.ITF, 2, 60, true, barcode);
        final String title7 = "CODEBAR Barcode\r\n";
        byte[] CODEBAR = WoosimBarcode.createBarcode(WoosimBarcode.CODEBAR, 2, 60, true, barcode);
        final String title8 = "CODE93 Barcode\r\n";
        byte[] CODE93 = WoosimBarcode.createBarcode(WoosimBarcode.CODE93, 2, 60, true, barcode);
        final String title9 = "CODE128 Barcode\r\n";
        byte[] CODE128 = WoosimBarcode.createBarcode(WoosimBarcode.CODE128, 2, 60, true, barcode);

        ByteArrayOutputStream byteStream = new ByteArrayOutputStream(512);
        byteStream.write(title1.getBytes()); byteStream.write(UPCA); byteStream.write(cmd_print);
        byteStream.write(title2.getBytes()); byteStream.write(UPCE); byteStream.write(cmd_print);
        byteStream.write(title3.getBytes()); byteStream.write(EAN13); byteStream.write(cmd_print);
        byteStream.write(title4.getBytes()); byteStream.write(EAN8); byteStream.write(cmd_print);
        byteStream.write(title5.getBytes()); byteStream.write(CODE39); byteStream.write(cmd_print);
        byteStream.write(title6.getBytes()); byteStream.write(ITF); byteStream.write(cmd_print);
        byteStream.write(title7.getBytes()); byteStream.write(CODEBAR); byteStream.write(cmd_print);
        byteStream.write(title8.getBytes()); byteStream.write(CODE93); byteStream.write(cmd_print);
        byteStream.write(title9.getBytes()); byteStream.write(CODE128); byteStream.write(cmd_print);

        sendData(WoosimCmd.initPrinter());
        sendData(byteStream.toByteArray());
    }

    public void print2DBarcode(View v) throws IOException {
        final byte[] barcode = {0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30};
        final byte[] cmd_print = WoosimCmd.printData();
        final String title1 = "PDF417 2D Barcode\r\n";
        byte[] PDF417 = WoosimBarcode.create2DBarcodePDF417(2, 3, 4, 2, false, barcode);
        final String title2 = "DATAMATRIX 2D Barcode\r\n";
        byte[] dataMatrix = WoosimBarcode.create2DBarcodeDataMatrix(0, 0, 6, barcode);
        final String title3 = "QR-CODE 2D Barcode\r\n";
        byte[] QRCode = WoosimBarcode.create2DBarcodeQRCode(0, (byte)0x4d, 5, barcode);
        final String title4 = "Micro PDF417 2D Barcode\r\n";
        byte[] microPDF417 = WoosimBarcode.create2DBarcodeMicroPDF417(2, 2, 0, 2, barcode);
        final String title5 = "Truncated PDF417 2D Barcode\r\n";
        byte[] truncPDF417 = WoosimBarcode.create2DBarcodeTruncPDF417(2, 3, 4, 2, false, barcode);
        // Maxicode can be printed only with RX version
        final String title6 = "Maxicode 2D Barcode\r\n";
        final byte[] mxcode = {0x41,0x42,0x43,0x44,0x45,0x31,0x32,0x33,0x34,0x35,0x61,0x62,0x63,0x64,0x65};
        byte[] maxCode = WoosimBarcode.create2DBarcodeMaxicode(4, mxcode);

        ByteArrayOutputStream byteStream = new ByteArrayOutputStream(512);
        byteStream.write(title1.getBytes()); byteStream.write(PDF417); byteStream.write(cmd_print);
        byteStream.write(title2.getBytes()); byteStream.write(dataMatrix); byteStream.write(cmd_print);
        byteStream.write(title3.getBytes()); byteStream.write(QRCode); byteStream.write(cmd_print);
        byteStream.write(title4.getBytes()); byteStream.write(microPDF417); byteStream.write(cmd_print);
        byteStream.write(title5.getBytes()); byteStream.write(truncPDF417); byteStream.write(cmd_print);
        byteStream.write(title6.getBytes()); byteStream.write(maxCode); byteStream.write(cmd_print);

        sendData(WoosimCmd.initPrinter());
        sendData(byteStream.toByteArray());
    }

    public void printGS1Databar(View v) throws IOException {
        final byte[] data = {0x30,0x30,0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30};
        final byte[] cmd_print = WoosimCmd.printData();
        final String title0 = "GS1 Databar type0\r\n";
        byte[] gs0 = WoosimBarcode.createGS1Databar(0, 2, data);
        final String title1 = "GS1 Databar type1\r\n";
        byte[] gs1 = WoosimBarcode.createGS1Databar(1, 2, data);
        final String title2 = "GS1 Databar type2\r\n";
        byte[] gs2 = WoosimBarcode.createGS1Databar(2, 2, data);
        final String title3 = "GS1 Databar type3\r\n";
        byte[] gs3 = WoosimBarcode.createGS1Databar(3, 2, data);
        final String title4 = "GS1 Databar type4\r\n";
        byte[] gs4 = WoosimBarcode.createGS1Databar(4, 2, data);
        final String title5 = "GS1 Databar type5\r\n";
        final byte[] data5 = {0x5b,0x30,0x31,0x5d,0x39,0x30,0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x38,
                0x5b,0x33,0x31,0x30,0x33,0x5d,0x30,0x31,0x32,0x32,0x33,0x33};
        byte[] gs5 = WoosimBarcode.createGS1Databar(5, 2, data5);
        final String title6 = "GS1 Databar type6\r\n";
        final byte[] data6 = {0x5b,0x30,0x31,0x5d,0x39,0x30,0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x38,
                0x5b,0x33,0x31,0x30,0x33,0x5d,0x30,0x31,0x32,0x32,0x33,0x33,
                0x5b,0x31,0x35,0x5d,0x39,0x39,0x31,0x32,0x33,0x31};
        byte[] gs6 = WoosimBarcode.createGS1Databar(6, 4, data6);

        ByteArrayOutputStream byteStream = new ByteArrayOutputStream(512);
        byteStream.write(title0.getBytes()); byteStream.write(gs0); byteStream.write(cmd_print);
        byteStream.write(title1.getBytes()); byteStream.write(gs1); byteStream.write(cmd_print);
        byteStream.write(title2.getBytes()); byteStream.write(gs2); byteStream.write(cmd_print);
        byteStream.write(title3.getBytes()); byteStream.write(gs3); byteStream.write(cmd_print);
        byteStream.write(title4.getBytes()); byteStream.write(gs4); byteStream.write(cmd_print);
        byteStream.write(title5.getBytes()); byteStream.write(gs5); byteStream.write(cmd_print);
        byteStream.write(title6.getBytes()); byteStream.write(gs6); byteStream.write(cmd_print);

        sendData(WoosimCmd.initPrinter());
        sendData(byteStream.toByteArray());
    }

    public void setMSRDoubleTrackMode(View v) {
        clearMSRInfo();
        sendData(WoosimCmd.MSR_doubleTrackMode());
        mWoosim.clearRcvBuffer();
    }

    public void setMSRTripleTrackMode(View v) {
        clearMSRInfo();
        sendData(WoosimCmd.MSR_tripleTrackMode());
        mWoosim.clearRcvBuffer();
    }

    public void cancelMSRMode(View v) {
        sendData(WoosimCmd.MSR_exit());
    }

    public void clearMSRInfo(View v) {
        clearMSRInfo();
    }

    private void clearMSRInfo() {
        mTrack1View.setText("");
        mTrack2View.setText("");
        mTrack3View.setText("");
    }
}
