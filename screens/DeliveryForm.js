import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Button,
  PermissionsAndroid,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import {RadioButton, TouchableRipple} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import MultipleSelect from '../components/MultipleSelect';
import MultiSelect from 'react-native-multiple-select';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import LocationSwitch from 'react-native-location-permission';
import Orientation from 'react-native-orientation';
import emailjs from 'emailjs-com';
import Communications from 'react-native-communications';
import BluetoothPrinter from '../components/BluetoothPrinter';
import Icon from 'react-native-vector-icons/Ionicons';
import ToastExample from '../ToastExample';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import RNSmtpMailer from 'react-native-smtp-mailer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
let imageWidth, imageHeight;

export default function DeliveryForm({navigation, route, loginArr}) {
  let dateIn = new Date().toISOString();
  let dateOut;
  let arr = [];
  //const postUrl = 'https://webhook.site/b4a73f8e-bf83-44a0-a001-f41d59febe98';
  const postUrl =
    'https://bulkscheduling.pakoxygen.com/api/Delivery/setDelivery';
  const remarksUrl =
    'https://bulkscheduling.pakoxygen.com/api/Delivery/getRemarksMaster';
  function getImageUrl(tdlsNo, attachmentType) {
    return `https://bulkscheduling.pakoxygen.com/api/Delivery/getAttachment?TripNo=${tdlsNo}&AttachmentType=${attachmentType}`;
  }

  const [formUploaded, setFormUploaded] = useState();
  const [items, setItems] = useState([]);
  const [latitudeIn, setLatitudeIn] = useState();
  const [latitudeOut, setLatitudeOut] = useState();
  const [longitudeIn, setLongitudeIn] = useState();
  const [longitudeOut, setLongitudeOut] = useState();

  LocationSwitch.isLocationEnabled(
    () => {
      Geolocation.getCurrentPosition(location => {
        setLatitudeIn(location.coords.latitude);
        setLongitudeIn(location.coords.longitude);
      }).catch(e => {
        console.log(e);
      });

      Geolocation.getCurrentPosition(location => {
        setLatitudeOut(location.coords.latitude);
        setLongitudeOut(location.coords.longitude);
      }).catch(e => {
        console.log(e);
      });
    },
    () => {
      setLatitudeIn(null);
      setLongitudeIn(null);
      setLatitudeOut(null);
      setLongitudeOut(null);
    },
  );

  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState();

  const [checked, setChecked] = useState(
    loginArr.LoginCategoryID == 1
      ? route.params.listData.CalculationBaseTypeID
      : 1,
  );

  const [checkedString, setCheckedString] = useState(
    loginArr.LoginCategoryID == 1
      ? route.params.listData.CalculationBaseType
      : 'By Volume',
  );
  const [pickerValue, setPickerValue] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.vie_press_start_unit
      : 'PSI',
  );
  const [pickerValue1, setPickerValue1] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.vie_level_start_unit
      : 'INCH',
  );
  const [pickerValue2, setPickerValue2] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.tanker_press_start_unit
      : 'PSI',
  );
  const [pickerValue3, setPickerValue3] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.tanker_level_start_unit
      : 'INCH',
  );
  const [pickerValue4, setPickerValue4] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.vie_press_end_unit
      : 'PSI',
  );
  const [pickerValue5, setPickerValue5] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.vie_level_end_unit
      : 'INCH',
  );
  const [pickerValue6, setPickerValue6] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.tanker_press_end_unit
      : 'PSI',
  );
  const [pickerValue7, setPickerValue7] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.tanker_level_end_unit
      : 'INCH',
  );

  const [pickerValue8, setPickerValue8] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.content_start_unit
      : 'M3',
  );
  const [pickerValue9, setPickerValue9] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.content_end_unit
      : 'M3',
  );
  const [pickerValue10, setPickerValue10] = useState(
    !(
      route.params.listData.Trip_Status == 1 ||
      route.params.listData.Trip_Status == 3
    )
      ? route.params.listData.uom
      : 'M3',
  );
  const [pickerValue11, setPickerValue11] = useState(
    route.params.listData.Trip_Status,
  );

  const [odometerIn, setOdometerIn] = useState(
    route.params.listData.odometerin == null
      ? route.params.listData.odometerin
      : route.params.listData.odometerin.toString(),
  );
  const [odometerOut, setOdometerOut] = useState(
    route.params.listData.odometerout == null
      ? route.params.listData.odometerout
      : route.params.listData.odometerout.toString(),
  );
  const [viePressStart, setViePressStart] = useState(
    route.params.listData.vie_press_start == null
      ? route.params.listData.vie_press_start
      : route.params.listData.vie_press_start.toString(),
  );
  const [viePressEnd, setViePressEnd] = useState(
    route.params.listData.vie_press_end == null
      ? route.params.listData.vie_press_end
      : route.params.listData.vie_press_end.toString(),
  );
  const [vieLevelStart, setVieLevelStart] = useState(
    route.params.listData.vie_level_start == null
      ? route.params.listData.vie_level_start
      : route.params.listData.vie_level_start.toString(),
  );
  const [vieLevelEnd, setVieLevelEnd] = useState(
    route.params.listData.vie_level_end == null
      ? route.params.listData.vie_level_end
      : route.params.listData.vie_level_end.toString(),
  );
  const [tankerPressStart, setTankerPressStart] = useState(
    route.params.listData.tanker_press_start == null
      ? route.params.listData.tanker_press_start
      : route.params.listData.tanker_press_start.toString(),
  );
  const [tankerPressEnd, setTankerPressEnd] = useState(
    route.params.listData.tanker_press_end == null
      ? route.params.listData.tanker_press_end
      : route.params.listData.tanker_press_end.toString(),
  );
  const [tankerLevelStart, setTankerLevelStart] = useState(
    route.params.listData.tanker_level_start == null
      ? route.params.listData.tanker_level_start
      : route.params.listData.tanker_level_start.toString(),
  );
  const [tankerLevelEnd, setTankerLevelEnd] = useState(
    route.params.listData.tanker_level_end == null
      ? route.params.listData.tanker_level_end
      : route.params.listData.tanker_level_end.toString(),
  );
  const [startContent, setStartContent] = useState(
    route.params.listData.tanker_content_start == null
      ? route.params.listData.tanker_content_start
      : route.params.listData.tanker_content_start.toString(),
  );
  const [endContent, setEndContent] = useState(
    route.params.listData.tanker_content_end == null
      ? route.params.listData.tanker_content_end
      : route.params.listData.tanker_content_end.toString(),
  );

  const [contentDiff, setContentDiff] = useState(
    route.params.listData.tanker_content_diff == null
      ? route.params.listData.tanker_content_diff
      : route.params.listData.tanker_content_diff.toString(),
  );
  // const [contentDiff, setContentDiff] = useState(
  //   (parseFloat(startContent) - parseFloat(endContent)).toString(),
  // );
  const [additionalRemarks, setAdditionalRemarks] = useState(
    route.params.listData.Additional_Remarks,
  );
  const [statusReason, setStatusReason] = useState(
    route.params.listData.StatusReason,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState();
  // const [imageWidth, setImageWidth] = useState();
  // const [imageHeight, setImageHeight] = useState();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [signImage, setSignImage] = useState();
  const [signUploaded, setSignUploaded] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);

  const [formFilled, setFormFilled] = useState(false);
  const [pdfPath, setPdfPath] = useState();

  const [DeliveryListData, setDeliveryListData] = useState([]);

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 900,
      height: 1200,
      cropping: true,
      compressImageQuality: 0.4,
      includeBase64: true,
      freeStyleCropEnabled: true,
    }).then(image => {
      console.log(image);
      //setImage(`data:${image.mime};base64,${image.data}`);
      setImage(`${image.data}`);
      setImageUploaded(true);
      setModalOpen(false);
    });
  };

  async function getImage() {
    setLoadingImage(true);
    console.log('Getting image...');
    console.log('Image: ', route.params.listData.Image);
    const response = await axios
      .get(getImageUrl(route.params.listData.TDLS_No, 1))
      .then(response => {
        setLoadingImage(false);
        setImage(response.data);
        if (response.data != '') {
          console.log('there is something in image');
          setImageUploaded(true);
        }
        console.log(response.data);
      });
  }

  async function getSign() {
    setLoadingSign(true);
    console.log('Getting signature...');
    console.log('Signature: ', route.params.listData.Signature);
    const res = await axios
      .get(getImageUrl(route.params.listData.TDLS_No, 2))
      .then(res => {
        setLoadingSign(false);
        setSignImage(res.data);
        if (res.data != '') {
          console.log('there is something in sign');
          setSignUploaded(true);
        }
        console.log(res.data);
      });
  }

  // useEffect(() => {
  //   console.log('Image: ', route.params.listData.Image);
  //   console.log('Signature: ', route.params.listData.Signature);
  //   if (!(route.params.listData.Image == '0' && route.params.listData.Signature == '0')) {
  //     console.log('image and signature are both not zero');
  //     async function getData() {
  //       const response = await axios.get(getImageUrl(route.params.listData.TDLS_No, 1));
  //       setImage(response.data);
  //       if (response.data != '') {
  //         console.log('there is something in image');
  //         setImageUploaded(true);
  //       }
  //       console.log(response.data);
  //       const res = await axios.get(getImageUrl(route.params.listData.TDLS_No, 2));
  //       setSignImage(res.data);
  //       if (res.data != '') {
  //         console.log('there is something in sign');
  //         setSignUploaded(true);
  //       }
  //       console.log(res.data);
  //     }
  //     getData();
  //   }
  // }, []);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.isConnected == true) {
        async function getData() {
          const response = await axios.get(remarksUrl);
          setItems(response.data);
          addRemarks(response.data);
          console.log(response.data);
          console.log('items: ', items);
        }
        getData();
      } else {
        getRemarks();
      }
    });
    route.params.listData.TDLSRemarks.map(element => {
      console.log('Selected Remarks: ', element.RemarksMasterID);
      arr.push(element.RemarksMasterID);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected == true) {
          async function getformData() {
            await firestore()
              .collection('FormData')
              .get()
              .then(Snapshot => {
                Snapshot.docs.map(doc => {
                  fetch(postUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(doc.data()),
                  }).then(response => {
                    console.log(response);
                    if (response.status == 200) {
                      firestore()
                        .collection('FormData')
                        .doc(`${doc.data().TDLS_No}`)
                        .delete();
                      console.log('Deleting form no: ', doc.data().TDLS_No);
                      console.warn('Pending form Submitted successfully.');
                    } else {
                      console.warn('Pending forms submission failed.');
                    }
                  });
                });
              })
              .then(() => {
                console.log('forms will be submitted to api');
              });
          }
          getformData();
        } else {
          console.log(
            'No internet connection. Forms will be submitted to local storage',
          );
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [postUrl]);

  const handleCallback = childData => {
    ImageResizer.createResizedImage(
      `data:image/png;base64,${childData}`,
      230,
      100,
      'JPEG',
      100,
      0,
      undefined,
      false,
      {},
    )
      .then(response => {
        console.log(response);
        RNFS.readFile(response.uri, 'base64').then(res => {
          // route.params.parentCallback(`data:image/png;base64,${res}`);
          console.log('base64: ', res);
          setSignImage(res);
          setSignUploaded(true);
        });
        // response.uri is the URI of the new image that can now be displayed, uploaded...
        // response.path is the path of the new image
        // response.name is the name of the new image with the extension
        // response.size is the size of the new image
      })
      .catch(err => {
        console.log(err);
        // Oops, something went wrong. Check that the filename is correct and
        // inspect err to get more details.
      });
  };

  const [selectedItems, setSelectedItems] = useState(arr);

  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  function addRemarks(data) {
    firestore().collection('DL').doc('Remarks').set({data});
    // try {
    //   await AsyncStorage.setItem('Remarks', JSON.stringify(data));
    // } catch (e) {
    //   console.log(e);
    // }
  }

  async function getRemarks() {
    const document = await firestore().collection('DL').doc('Remarks').get();
    setItems(document._data.data);
    console.log('from local storage: ', document._data.data);
    // try {
    //   const document = JSON.parse(await AsyncStorage.getItem('Remarks'));
    //   setItems(document._data.data);
    //   console.log('from local storage: ', document);
    // } catch (error) {
    //   console.log(error);
    // }
  }

  // async function addSDLData(data) {
  //   //firestore().collection('DL').doc('SDL').set({data});
  //   try {
  //     await AsyncStorage.setItem(
  //       `SDL_${loginArr.LoginId}`,
  //       JSON.stringify(data),
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   console.log('sdl data stored in local storage');
  // }

  // async function addDDLData(data) {
  //   //firestore().collection('DL').doc('DDL').set({data});
  //   try {
  //     await AsyncStorage.setItem(
  //       `DDL_${loginArr.LoginId}`,
  //       JSON.stringify(data),
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   console.log('ddl data stored in local storage');
  // }

  function getUpdatedData() {
    axios
      .get(
        loginArr.LoginCategoryID == '1'
          ? `https://bulkscheduling.pakoxygen.com/api/Delivery/getSchedulerList_DateAndAll?userid=${loginArr.LoginId}&From=&To=`
          : `https://bulkscheduling.pakoxygen.com/api/Delivery/getDecanterList_DateAndAll?userid=${loginArr.LoginId}&From=&To=`,
      )
      .then(function (response) {
        console.log(response);
        setDeliveryListData(response.data);
        console.log('from api: ', response.data);
        alert('Form submitted successfully.');
        navigation.goBack();
        route.params.parentCallBack(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // async function getUpdatedLocalData() {
  //   //const document = await firestore().collection('DL').doc('DDL').get();
  //   try {
  //     const document =
  //       loginArr.LoginCategoryID == '1'
  //         ? await firestore().collection('SDL').doc(`${loginArr.LoginId}`).get()
  //         : await firestore()
  //             .collection('DDL')
  //             .doc(`${loginArr.LoginId}`)
  //             .get();
  //     alert('No internet connection. Form saved in local storage.');
  //     console.log('from local storage: ', document._data.data);
  //     navigation.goBack();
  //     route.params.parentCallBack(document._data.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  function submitData() {
    try {
      setFormUploaded(false);
      NetInfo.fetch().then(state => {
        if (state.isConnected == true) {
          fetch(postUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData()),
          }).then(response => {
            console.log('response: ', response);
            setFormUploaded(true);
            getUpdatedData();
          });
        } else {
          addFormDataToDB().then(() => {
            alert('No internet connection. Form saved in local storage.');
            navigation.pop();
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function addFormDataToDB() {
    firestore()
      .collection('FormData')
      .doc(`${route.params.listData.TDLS_No}`)
      .set(formData())
      .then(() => {
        console.log('No internet connection. Form saved in local storage.');
      })
      .catch(error => {
        console.log(error);
      });

    // try {
    //   var prevData = JSON.parse(await AsyncStorage.getItem('FormData'));
    //   prevData.push(formData());
    //   AsyncStorage.setItem('FormData', JSON.stringify(prevData));
    //   console.log('Form data inserted in local storage');
    // } catch (e) {
    //   console.log(e);
    // }
  }

  function formData() {
    dateOut = new Date().toISOString();
    return {
      BTTR_No: route.params.listData.BTTR_No,
      TDLS_No: route.params.listData.TDLS_No,
      Trip_No: route.params.listData.Trip_No,
      LoginCategoryID: loginArr.LoginCategoryID,
      LoginId: loginArr.LoginId,
      Delivery_Status: route.params.listData.Delivery_Status,
      Delivery_StatusDec: route.params.listData.Delivery_StatusDec,
      TractorNo: route.params.listData.TractorNo,
      TractorNumberPlate: route.params.listData.TractorNumberPlate,
      DriverNo: route.params.listData.DriverNo,
      DriverName: route.params.listData.DriverName,
      DecanterNo: route.params.listData.DecanterNo,
      DecanterName: route.params.listData.DecanterName,
      ScheduledStart: route.params.listData.ScheduledStart,
      ScheduledDate: route.params.listData.ScheduledDate,
      ScheduledFinish: route.params.listData.ScheduledFinish,
      TerminalStarting: route.params.listData.TerminalStarting,
      TerminalStartingName: route.params.listData.TerminalStartingName,
      TerminalEnding: route.params.listData.TerminalEnding,
      TerminalEndingName: route.params.listData.TerminalEndingName,
      PrimaryProduct: route.params.listData.PrimaryProduct,
      ProductName: route.params.listData.ProductName,
      CustomerNo: route.params.listData.CustomerNo,
      CustomerName: route.params.listData.CustomerName,
      TankerCode: null,
      TankerShortName: null,
      ScheduledAmount: route.params.listData.ScheduledAmount,
      CreditLimit: route.params.listData.CreditLimit,
      AvailableAmount: route.params.listData.AvailableAmount,
      ETA: route.params.listData.ETA,
      isDeliveryCharges: route.params.listData.isDeliveryCharges,
      Trip_Status: loginArr.LoginCategoryID == 1 ? pickerValue11 : 5,
      Trip_StatusDec:
        loginArr.LoginCategoryID == 1
          ? pickerValue11 == 6
            ? 'Approved'
            : 'Closed'
          : 'Submitted',
      Type: route.params.listData.Type,
      StatusReason: loginArr.LoginCategoryID == 1 ? statusReason : null,
      odometerin: parseFloat(odometerIn),
      odometerout: parseFloat(odometerOut),
      timein:
        loginArr.LoginCategoryID == 1 ? route.params.listData.timein : dateIn,
      timeout:
        loginArr.LoginCategoryID == 1 ? route.params.listData.timeout : dateOut,
      datein:
        loginArr.LoginCategoryID == 1 ? route.params.listData.datein : dateIn,
      dateout:
        loginArr.LoginCategoryID == 1 ? route.params.listData.dateout : dateOut,
      vehicleno: route.params.listData.vehicleno,
      weighbridgeno: null,
      vie_press_start: parseFloat(viePressStart),
      vie_level_start: parseFloat(vieLevelStart),
      tanker_press_start: parseFloat(tankerPressStart),
      tanker_level_start: parseFloat(tankerLevelStart),
      tanker_content_start: parseFloat(startContent),
      tanker_weight_start: null,
      tanker_flowmeter_start: null,
      vie_press_end: parseFloat(viePressEnd),
      vie_level_end: parseFloat(vieLevelEnd),
      tanker_press_end: parseFloat(tankerPressEnd),
      tanker_level_end: parseFloat(tankerLevelEnd),
      tanker_content_end: parseFloat(endContent),
      tanker_weight_end: null,
      tanker_flowmeter_end: null,
      tanker_press_diff:
        parseFloat(tankerPressStart) - parseFloat(tankerPressEnd),
      tanker_level_diff:
        parseFloat(tankerLevelStart) - parseFloat(tankerLevelEnd),
      tanker_content_diff:
        loginArr.LoginCategoryID == 1
          ? parseFloat(contentDiff)
          : parseFloat(startContent) - parseFloat(endContent),
      tanker_weight_diff: null,
      tanker_flowmeter_diff: null,
      vie_press_start_unit: pickerValue,
      vie_level_start_unit: pickerValue1,
      tanker_press_start_unit: pickerValue2,
      tanker_level_start_unit: pickerValue3,
      vie_press_end_unit: pickerValue4,
      vie_level_end_unit: pickerValue5,
      tanker_press_end_unit: pickerValue6,
      tanker_level_end_unit: pickerValue7,
      uom: pickerValue10,
      Tdls_Status: route.params.listData.Tdls_Status,
      Tdls_StatusDec: route.params.listData.Tdls_StatusDec,
      latitude_in:
        loginArr.LoginCategoryID == 1
          ? route.params.listData.latitude_in
          : latitudeIn,
      longitude_in:
        loginArr.LoginCategoryID == 1
          ? route.params.listData.longitude_in
          : longitudeIn,
      latitude_out:
        loginArr.LoginCategoryID == 1
          ? route.params.listData.latitude_out
          : latitudeOut,
      longitude_out:
        loginArr.LoginCategoryID == 1
          ? route.params.listData.longitude_out
          : longitudeOut,
      spervisor_name: null,
      driver_name: null,
      decanter_name: null,
      remarks: selectedItems.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      DeliveryNote: null,
      PurchaseOrder: null,
      SupplyDate: null,
      Plant: null,
      ManualTDLSNo: null,
      isManualTDLSNo: null,
      CalculationBaseTypeID: checked,
      CalculationBaseType: checkedString,
      CalculationContentTypeID: null,
      CalculationContentType: null,
      Image: image,
      ImagePath: null,
      Signature: signImage,
      SignaturePath: null,
      TDLSRemarks: [],
      content_start_unit: pickerValue8,
      content_end_unit: pickerValue9,
      Additional_Remarks: additionalRemarks,
      Trip_Reason: statusReason,
      Weighbridge_No: null,
      NetWeight: null,
    };
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Delivery Number (TDLS)</Text>
          <TextInput
            style={[styles.input1, styles.noneditable]}
            value={route.params.listData.TDLS_No.toString()}
            editable={false}
          />
        </View>

        <View>
          <Text style={styles.txt}>Trip Number (BTTR)</Text>
          <TextInput
            style={[styles.input1, styles.noneditable]}
            value={route.params.listData.BTTR_No.toString()}
            editable={false}
          />
        </View>
      </View>

      {loginArr.LoginCategoryID == '1' ? (
        <View>
          <Text style={styles.txt}>Customer Code</Text>
          <TextInput
            style={[styles.input, styles.noneditable]}
            value={route.params.listData.CustomerNo}
            editable={false}
          />
        </View>
      ) : (
        <View />
      )}

      <Text style={styles.txt}>Customer Name</Text>
      <TextInput
        style={[styles.input, styles.noneditable]}
        value={route.params.listData.CustomerName}
        editable={false}
      />

      {loginArr.LoginCategoryID == '1' ? (
        <View>
          <Text style={styles.txt}>Product Code</Text>
          <TextInput
            style={[styles.input, styles.noneditable]}
            value={route.params.listData.PrimaryProduct}
            editable={false}
          />
        </View>
      ) : (
        <View />
      )}

      <Text style={styles.txt}>Product Name</Text>
      <TextInput
        style={[styles.input, styles.noneditable]}
        value={route.params.listData.ProductName}
        editable={false}
      />

      {loginArr.LoginCategoryID == '1' ? (
        <View>
          <Text style={styles.txt}>Vehicle Number</Text>
          <TextInput
            style={[styles.input, styles.noneditable]}
            value={route.params.listData.vehicleno}
            editable={false}
          />
        </View>
      ) : (
        <View />
      )}

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Odometer In</Text>
          <TextInput
            style={styles.input1}
            keyboardType="numeric"
            value={odometerIn}
            onChangeText={val => setOdometerIn(val)}
          />
        </View>

        <View>
          <Text style={styles.txt}>Odometer Out</Text>
          <TextInput
            style={styles.input1}
            keyboardType="numeric"
            value={odometerOut}
            onChangeText={val => setOdometerOut(val)}
          />
        </View>
      </View>

      <View style={{paddingVertical: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <RadioButton
            color="#077caa"
            uncheckedColor="#077caa"
            value={1}
            status={checked === 1 ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(1);
              setCheckedString('By Volume');
              setPickerValue8('M3');
              setPickerValue9('M3');
              setPickerValue10('M3');
            }}
          />
          <Text style={{paddingRight: 10}}>By Volume</Text>
          <RadioButton
            color="#077caa"
            uncheckedColor="#077caa"
            value={2}
            status={checked === 2 ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(2);
              setCheckedString('By Weight');
              setPickerValue8('KG');
              setPickerValue9('KG');
              setPickerValue10('KG');
            }}
          />
          <Text>By Weight</Text>
        </View>
      </View>

      <Text style={styles.headings}>VIE Data (Start)</Text>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Pressure Start</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={viePressStart}
              onChangeText={val => setViePressStart(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue}
                onValueChange={itemValue => setPickerValue(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="PSI" value="PSI" />
                <Picker.Item label="BAR" value="BAR" />
              </Picker>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.txt}>Level Start</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={vieLevelStart}
              onChangeText={val => setVieLevelStart(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue1}
                onValueChange={itemValue => setPickerValue1(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="INCH" value="INCH" />
                <Picker.Item label="IWC" value="IWC" />
                <Picker.Item label="MMWC" value="MMWC" />
                <Picker.Item label="MMBC" value="MMBC" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.headings}>Tanker Data (Start)</Text>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Pressure Start</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={tankerPressStart}
              onChangeText={val => setTankerPressStart(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue2}
                onValueChange={itemValue => setPickerValue2(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="PSI" value="PSI" />
                <Picker.Item label="BAR" value="BAR" />
              </Picker>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.txt}>Level Start</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={tankerLevelStart}
              onChangeText={val => setTankerLevelStart(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue3}
                onValueChange={itemValue => setPickerValue3(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="INCH" value="INCH" />
                <Picker.Item label="IWC" value="IWC" />
                <Picker.Item label="MMWC" value="MMWC" />
                <Picker.Item label="MMBC" value="MMBC" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.headings}>VIE Data (Ends)</Text>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Pressure Ends</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={viePressEnd}
              onChangeText={val => setViePressEnd(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue4}
                onValueChange={itemValue => setPickerValue4(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="PSI" value="PSI" />
                <Picker.Item label="BAR" value="BAR" />
              </Picker>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.txt}>Level Ends</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={vieLevelEnd}
              onChangeText={val => setVieLevelEnd(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue5}
                onValueChange={itemValue => setPickerValue5(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="INCH" value="INCH" />
                <Picker.Item label="IWC" value="IWC" />
                <Picker.Item label="MMWC" value="MMWC" />
                <Picker.Item label="MMBC" value="MMBC" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.headings}>Tanker Data (Ends)</Text>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Pressure Ends</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={tankerPressEnd}
              onChangeText={val => setTankerPressEnd(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue6}
                onValueChange={itemValue => setPickerValue6(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="PSI" value="PSI" />
                <Picker.Item label="BAR" value="BAR" />
              </Picker>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.txt}>Level Ends</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={tankerLevelEnd}
              onChangeText={val => setTankerLevelEnd(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue7}
                onValueChange={itemValue => setPickerValue7(itemValue)}>
                <Picker.Item label="Unit" value="" />
                <Picker.Item label="INCH" value="INCH" />
                <Picker.Item label="IWC" value="IWC" />
                <Picker.Item label="MMWC" value="MMWC" />
                <Picker.Item label="MMBC" value="MMBC" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.headings}>Content Data</Text>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Start Content</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={startContent}
              onChangeText={val => setStartContent(val)}
            />
            {/* <TextInput
              style={[styles.input2, styles.noneditable]}
              value={checked === 'volume' ? 'M3' : 'KG'}
              editable={false}
            /> */}
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue8}
                onValueChange={itemValue => setPickerValue8(itemValue)}>
                <Picker.Item label="Select Unit" value="" />
                <Picker.Item label="M3" value="M3" />
                <Picker.Item label="KG" value="KG" />
              </Picker>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.txt}>End Content</Text>
          <View style={styles.divided}>
            <TextInput
              style={styles.input2}
              keyboardType="numeric"
              value={endContent}
              onChangeText={val => setEndContent(val)}
            />
            <View style={styles.pickerView}>
              <Picker
                style={styles.picker}
                selectedValue={pickerValue9}
                onValueChange={itemValue => setPickerValue9(itemValue)}>
                <Picker.Item label="Select Unit" value="" />
                <Picker.Item label="M3" value="M3" />
                <Picker.Item label="KG" value="KG" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divided}>
        <View>
          <Text style={styles.txt}>Content</Text>
          {loginArr.LoginCategoryID == 1 ? (
            <TextInput
              style={styles.input1}
              keyboardType="numeric"
              value={contentDiff}
              onChangeText={val => setContentDiff(val)}
            />
          ) : (
            <TextInput
              style={styles.input1}
              keyboardType="numeric"
              value={(
                parseFloat(startContent) - parseFloat(endContent)
              ).toString()}
            />
          )}
        </View>

        <View>
          <Text style={styles.txt}>Unit</Text>
          <View style={styles.pickerView1}>
            <Picker
              style={styles.picker1}
              selectedValue={pickerValue10}
              onValueChange={itemValue => setPickerValue10(itemValue)}>
              <Picker.Item label="Select Unit" value="" />
              <Picker.Item label="M3" value="M3" />
              <Picker.Item label="KG" value="KG" />
            </Picker>
          </View>
        </View>
      </View>

      <View>
        <Text style={styles.headings}>Remarks by Decentre</Text>

        <View>
          <MultiSelect
            hideTags
            items={items}
            uniqueKey="RemarksMasterID"
            ref={component => {
              MultiSelect.multiSelect = component;
            }}
            onSelectedItemsChange={onSelectedItemsChange}
            selectedItems={selectedItems}
            selectText="Select Remarks"
            searchInputPlaceholderText="Search Remarks..."
            onChangeInput={text => console.log(text)}
            altFontFamily="ProximaNova-Light"
            tagRemoveIconColor="#077caa"
            tagBorderColor="#077caa"
            tagTextColor="#077caa"
            selectedItemTextColor="#077caa"
            selectedItemIconColor="#077caa"
            itemTextColor="#000"
            displayKey="Remarks"
            searchInputStyle={{color: '#000'}}
            submitButtonColor="#077caa"
            submitButtonText="Confirm"
            hideDropdown={false}
            hideSubmitButton={false}
            styleDropdownMenu={{
              borderWidth: 0.6,
              borderColor: 'gray',
              paddingLeft: 10,
              height: 47,
            }}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Additional Remarks"
          value={additionalRemarks}
          onChangeText={val => setAdditionalRemarks(val)}
          multiline
        />

        {/* Image Modal */}

        <Modal
          visible={modalOpen}
          style={{
            backgroundColor: 'white',
            margin: 15,
            alignItems: undefined,
            justifyContent: undefined,
          }}>
          <View style={styles.modalContent}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {/* {imageUploaded == true
                ? Image.getSize(
                    `data:image/png;base64,${image}`,
                    (width, height) => {
                      console.log(width, height);
                      // imageWidth = width;
                      // imageHeight = height;
                    },
                  )
                : null} */}
              {imageUploaded == true ? (
                <Image
                  style={{
                    width: '100%',
                    height: '100%',
                    marginBottom: 0,
                  }}
                  source={{
                    uri: `data:image/png;base64,${image}`,
                  }}
                />
              ) : null}
            </View>
            {route.params.listData.Trip_Status == 1 ||
            route.params.listData.Trip_Status == 3 ? (
              <TouchableOpacity onPress={takePhotoFromCamera}>
                <View style={styles.chooseImageBtn}>
                  <Text style={{color: 'white', fontSize: 17}}>
                    CHOOSE ANOTHER IMAGE
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <View style={styles.closeBtn}>
                <Text style={{color: 'white', fontSize: 17}}>CLOSE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Image Uploading */}

        <View style={styles.divided}>
          {route.params.listData.Image == 0 ? (
            <TouchableOpacity
              onPress={
                imageUploaded ? () => setModalOpen(true) : takePhotoFromCamera
              }>
              <View style={styles.upload}>
                {imageUploaded ? (
                  <ImageBackground
                    style={{width: 175, height: 99}}
                    source={{
                      uri: `data:${image.mime};base64,${image}`,
                    }}></ImageBackground>
                ) : (
                  <Text style={{fontWeight: 'bold'}}>Upload Image</Text>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={imageUploaded ? () => setModalOpen(true) : getImage}>
              <View style={styles.upload}>
                {imageUploaded ? (
                  <ImageBackground
                    style={{width: 175, height: 99}}
                    source={{
                      uri: `data:${image.mime};base64,${image}`,
                    }}></ImageBackground>
                ) : (
                  <View>
                    {loadingImage ? (
                      <ActivityIndicator size="large" color="#1769e0" />
                    ) : (
                      <Text style={{fontWeight: 'bold'}}>View Image</Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Signature Uploading */}

          {route.params.listData.Signature == 0 ? (
            <TouchableOpacity
              onPress={() => {
                navigation.push('SignatureCanvas', {
                  parentCallback: handleCallback,
                });
              }}>
              <View style={styles.upload}>
                {signUploaded ? (
                  <ImageBackground
                    style={{width: windowWidth / 2.25, height: 65}}
                    source={{
                      uri: `data:image/jpeg;base64,${signImage}`,
                    }}></ImageBackground>
                ) : (
                  <Text style={{fontWeight: 'bold'}}>Signature</Text>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={getSign}>
              <View style={styles.upload}>
                {signUploaded ? (
                  <ImageBackground
                    style={{width: windowWidth / 2.25, height: 65}}
                    source={{
                      uri: `data:image/jpeg;base64,${signImage}`,
                    }}></ImageBackground>
                ) : (
                  <View>
                    {loadingSign ? (
                      <ActivityIndicator size="large" color="#1769e0" />
                    ) : (
                      <Text style={{fontWeight: 'bold'}}>View Signature</Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{paddingVertical: 5}} />

      {/* Approve/Reject Status */}

      {loginArr.LoginCategoryID == '1' ? (
        <View>
          <Text style={styles.headings}>Trip Status</Text>
          <View style={styles.pickerView2}>
            <Picker
              style={styles.picker2}
              selectedValue={pickerValue11}
              onValueChange={itemValue => setPickerValue11(itemValue)}>
              <Picker.Item label="Approve/Reject" value="" />
              <Picker.Item label="Approve" value={6} />
              <Picker.Item label="Reject" value={4} />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Reason"
            multiline
            value={statusReason}
            onChangeText={val => setStatusReason(val)}
          />
        </View>
      ) : null}

      {/* Submit Button */}

      {
        (loginArr.LoginCategoryID == 1 &&
          route.params.listData.Trip_Status == 5) ||
        (loginArr.LoginCategoryID == 2 &&
          (route.params.listData.Trip_Status == 1 ||
            route.params.listData.Trip_Status == 3)) ? (
          <TouchableOpacity onPress={submitData}>
            <View style={styles.btn}>
              <Text style={styles.btntxt}>SUBMIT</Text>
            </View>
          </TouchableOpacity>
        ) : null
        // <TouchableOpacity onPress={sendmail}>
        //   <View style={styles.btn}>
        //     <Text style={styles.btntxt}>SEND PDF EMAIL</Text>
        //   </View>
        // </TouchableOpacity>
      }

      <View style={{paddingVertical: 20}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chooseImageBtn: {
    backgroundColor: 'green',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  closeBtn: {
    backgroundColor: 'rgb(194, 7, 7)',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  modalContent: {
    flex: 1,
  },
  close: {
    alignSelf: 'flex-end',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    padding: 7,
    borderWidth: 0.6,
    borderColor: 'gray',
    marginBottom: 15,
  },
  input1: {
    padding: 7,
    borderWidth: 0.6,
    borderColor: 'gray',
    marginBottom: 15,
    width: windowWidth / 2.23,
  },
  input2: {
    padding: 7,
    borderWidth: 0.6,
    borderColor: 'gray',
    marginBottom: 15,
    width: windowWidth / 4.5,
  },
  picker: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
    paddingTop: 15,
    alignSelf: 'center',
    height: 42,
    width: windowWidth / 2.92,
    bottom: 5,
  },
  pickerView: {
    width: windowWidth / 4.4,
    borderWidth: 0.6,
    borderColor: 'grey',
    marginBottom: 15,
  },
  picker1: {
    paddingTop: 15,
    alignSelf: 'center',
    height: 41,
    width: windowWidth / 2.05,
    bottom: 6,
  },
  pickerView1: {
    width: windowWidth / 2.23,
    borderWidth: 0.6,
    borderColor: 'grey',
    marginBottom: 15,
  },

  picker2: {
    paddingTop: 15,
    alignSelf: 'center',
    height: 43,
    bottom: 6,
    width: '100%',
  },
  pickerView2: {
    borderWidth: 0.6,
    borderColor: 'grey',
    marginBottom: 15,
    width: '100%',
  },
  btn: {
    marginTop: 20,
    backgroundColor: '#077caa',
    padding: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  btntxt: {
    color: 'white',
  },
  upload: {
    width: windowWidth / 2.23,
    height: 100,
    borderWidth: 0.6,
    borderColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  noneditable: {
    color: 'black',
    backgroundColor: 'rgb(236, 236, 233)',
  },

  txt: {
    paddingBottom: 3,
  },
  divided: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headings: {
    paddingVertical: 15,
    fontWeight: 'bold',
  },
});
