
import React, { Component } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
    Button,
    ScrollView,
    DeviceEventEmitter,
    NativeEventEmitter,
    Switch,
    TouchableOpacity,
    Dimensions,
    ToastAndroid
} from 'react-native';

import { BluetoothEscposPrinter, BluetoothManager, BluetoothTscPrinter } from "react-native-bluetooth-escpos-printer";

const img1 = '../assets/bmp_13.bmp';

var { height, width } = Dimensions.get('window');

export default class BluetoothPrinter extends Component {

    _listeners = [];

    constructor() {
        super();
        this.state = {
            devices: null,
            pairedDs: [],
            foundDs: [],
            bleOpend: false,
            loading: true,
            boundAddress: '',
            debugMsg: ''
        }
    }

    componentDidMount() {
        BluetoothManager.isBluetoothEnabled().then((enabled) => {
            this.setState({
                bleOpend: Boolean(enabled),
                loading: false
            })
        }, (err) => {
            err
        });

        if (Platform.OS === 'ios') {
            let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
                (rsp) => {
                    this._deviceAlreadPaired(rsp)
                }));
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
                this._deviceFoundEvent(rsp)
            }));
            this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
                this.setState({
                    name: '',
                    boundAddress: ''
                });
            }));
        } else if (Platform.OS === 'android') {
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp) => {
                    this._deviceAlreadPaired(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_DEVICE_FOUND, (rsp) => {
                    this._deviceFoundEvent(rsp)
                }));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_CONNECTION_LOST, () => {
                    this.setState({
                        name: '',
                        boundAddress: ''
                    });
                }
            ));
            this._listeners.push(DeviceEventEmitter.addListener(
                BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, () => {
                    ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
                }
            ))
        }
    }


    _deviceAlreadPaired(rsp) {
        var ds = null;
        if (typeof (rsp.devices) == 'object') {
            ds = rsp.devices;
        } else {
            try {
                ds = JSON.parse(rsp.devices);
            } catch (e) {
            }
        }
        if (ds && ds.length) {
            let pared = this.state.pairedDs;
            pared = pared.concat(ds || []);
            this.setState({
                pairedDs: pared
            });
        }
    }

    _deviceFoundEvent(rsp) {
        var r = null;
        try {
            if (typeof (rsp.device) == "object") {
                r = rsp.device;
            } else {
                r = JSON.parse(rsp.device);
            }
        } catch (e) {//alert(e.message);
            //ignore
        }
        //alert('f')
        if (r) {
            let found = this.state.foundDs || [];
            if (found.findIndex) {
                let duplicated = found.findIndex(function (x) {
                    return x.address == r.address
                });
                //CHECK DEPLICATED HERE...
                if (duplicated == -1) {
                    found.push(r);
                    this.setState({
                        foundDs: found
                    });
                }
            }
        }
    }

    _renderRow(rows) {
        let items = [];
        for (let i in rows) {
            let row = rows[i];
            if (row.address) {
                items.push(
                    <TouchableOpacity key={new Date().getTime() + i} style={styles.wtf} onPress={() => {
                        this.setState({
                            loading: true
                        });
                        BluetoothManager.connect(row.address)
                            .then((s) => {
                                this.setState({
                                    loading: false,
                                    boundAddress: row.address,
                                    name: row.name || "UNKNOWN"
                                })
                            }, (e) => {
                                this.setState({
                                    loading: false
                                })
                                alert(e);
                            })

                    }}><Text style={styles.name}>{row.name || "UNKNOWN"}</Text><Text
                        style={styles.address}>{row.address}</Text></TouchableOpacity>
                );
            }
        }
        return items;
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <Text>{this.state.debugMsg}</Text>
                {/* <Text>{JSON.stringify(this.state, null, 3)}</Text> */}
                <Text style={styles.title}>Blutooth Opended:{this.state.bleOpend ? "true" : "false"} <Text>Open BLE Before Scanning</Text> </Text>
                <View>
                    <Switch value={this.state.bleOpend} onValueChange={(v) => {
                        this.setState({
                            loading: true
                        })
                        if (!v) {
                            BluetoothManager.disableBluetooth().then(() => {
                                this.setState({
                                    bleOpend: false,
                                    loading: false,
                                    foundDs: [],
                                    pairedDs: []
                                });
                            }, (err) => { alert(err) });

                        } else {
                            BluetoothManager.enableBluetooth().then((r) => {
                                var paired = [];
                                if (r && r.length > 0) {
                                    for (var i = 0; i < r.length; i++) {
                                        try {
                                            paired.push(JSON.parse(r[i]));
                                        } catch (e) {
                                            //ignore
                                        }
                                    }
                                }
                                this.setState({
                                    bleOpend: true,
                                    loading: false,
                                    pairedDs: paired
                                })
                            }, (err) => {
                                this.setState({
                                    loading: false
                                })
                                alert(err)
                            });
                        }
                    }} />
                    <Button disabled={this.state.loading || !this.state.bleOpend} onPress={() => {
                        this._scan();
                    }} title="Scan" />
                </View>
                <Text style={styles.title}>Connected:<Text style={{ color: "blue" }}>{!this.state.name ? 'No Devices' : this.state.name}</Text></Text>
                <Text style={styles.title}>Found(tap to connect):</Text>
                {this.state.loading ? (<ActivityIndicator animating={true} />) : null}
                <View style={{ flex: 1, flexDirection: "column" }}>
                    {
                        this._renderRow(this.state.foundDs)
                    }
                </View>
                <Text style={styles.title}>Paired:</Text>
                {this.state.loading ? (<ActivityIndicator animating={true} />) : null}
                <View style={{ flex: 1, flexDirection: "column" }}>
                    {
                        this._renderRow(this.state.pairedDs)
                    }

                    <Button disabled={this.state.loading || this.state.boundAddress.length <= 0}
                        title="Print FOLLOWING Image" onPress={async () => {
                            try {
                                console.log('pign tring: ', img1);
                                await BluetoothEscposPrinter.printPic(this.props.signing, { width: 200, height: 200, mode: BluetoothTscPrinter.BITMAP_MODE.OVERWRITE });
                                await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {});
                            } catch (e) {
                                alert(e.message || "ERROR")
                            }
                        }} />
                    {/* <Button onPress={async () => {
                        await BluetoothEscposPrinter.printBarCode("123456789012", BluetoothEscposPrinter.BARCODETYPE.JAN13, 3, 120, 0, 2);
                        await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {});
                    }} title="Print BarCode" />
                    <Button onPress={async () => {
                        await BluetoothEscposPrinter.printQRCode("你是不是傻？", 280, BluetoothEscposPrinter.ERROR_CORRECTION.L);//.then(()=>{alert('done')},(err)=>{alert(err)});
                        await BluetoothEscposPrinter.printText("\r\n\r\n\r\n", {});
                    }} title="Print QRCode" />  */}


                    <Button onPress={async () => {
                        await BluetoothEscposPrinter.printText(
                            "________________________________________________________________" + "\n\n" +
                            "TDLS#                  " + this.props.deliveryData.TDLS_No + "\n" +
                            "Date                   " + this.props.deliveryData.ScheduledDate + "\n" +
                            "Customer #             " + this.props.deliveryData.CustomerNo + "\n" +
                            "Name                   " + this.props.deliveryData.CustomerName + "\n" +
                            "Product code           " + this.props.deliveryData.PrimaryProduct + "\n" +
                            "Description            " + this.props.deliveryData.ProductName + "\n" +
                            "Tanker #               " + this.props.deliveryData.vehicleno + "\n" +
                            "Decanter Name          " + this.props.deliveryData.DecanterName + "\n" +
                            "Driver Name            " + this.props.deliveryData.DriverName + "\n" +
                            "Date & Time In         " + this.props.deliveryData.datein + "\n" +
                            "Odometer In            " + this.props.odometerIn + "\n" +
                            "Date & Time Out        " + this.props.deliveryData.dateout + "\n" +
                            "Odometer Out           " + this.props.odometerOut + "\n" +
                            "Delivery in            " + this.props.checked + "\n" +
                            "________________________________________________________________" + "\n\n" +
                            "VIE Data               Start      End      Unit" + "\n" +
                            "________________________________________________________________" + "\n" +
                            "Pressure               " + this.props.viePressStart + "      " + this.props.viePressEnd + "      " + this.props.pickerValue + "\n" +
                            "Level                  " + this.props.vieLevelStart + "      " + this.props.vieLevelEnd + "      " + this.props.pickerValue1 + "\n" +
                            "________________________________________________________________" + "\n\n" +
                            "Delivered Volume       " + this.props.contentDiff + "\n" +
                            "Delivered Unit         " + this.props.unit + "\n" +
                            "Comments:              " + this.props.additionalRemarks + "\n" +
                            "Customer Signature:    " + "" + "\n" +//sig ki image
                            "Printed by:            " + this.props.loginArr.LoginId + "\n" +
                            "Print date:            " + this.props.deliveryData.dateout + "\n" +
                            "Device id :            " + "WOOSIM" + "\n" +
                            "Call on:               " + "+92.21.111-262725" + "\n" +
                            "Website:                www.pakoxygen.com" + "\n" +
                            "**If you want to keep a permanent record, please have a photocopy made**" + "\n\n\n\n", {});
                    }} title="Print Receipt" />
                </View>


            </ScrollView>
        );
    }

    _scan() {
        this.setState({
            loading: true
        })
        BluetoothManager.scanDevices()
            .then((s) => {
                var ss = s;
                var found = ss.found;
                try {
                    found = JSON.parse(found);//@FIX_it: the parse action too weired..
                } catch (e) {
                    //ignore
                }
                var fds = this.state.foundDs;
                if (found && found.length) {
                    fds = found;
                }
                this.setState({
                    foundDs: fds,
                    loading: false
                });
            }, (er) => {
                this.setState({
                    loading: false
                })
                alert('error' + JSON.stringify(er));
            });
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },

    title: {
        width: width,
        backgroundColor: "#eee",
        color: "#232323",
        paddingLeft: 8,
        paddingVertical: 4,
        textAlign: "left"
    },
    wtf: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    name: {
        flex: 1,
        textAlign: "left"
    },
    address: {
        flex: 1,
        textAlign: "right"
    }
});
