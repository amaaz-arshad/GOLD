import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';
import ToastExample from '../ToastExample';
import axios from 'axios';

function Header(props) {
  // props.formData.TDLS_No
  const [signImage, setSignImage] = React.useState('');

  function getImageUrl(tdlsNo, attachmentType) {
    return `https://bulkscheduling.pakoxygen.com/api/Delivery/getAttachment?TripNo=${tdlsNo}&AttachmentType=${attachmentType}`;
  }

  React.useEffect(() => {
    //console.log('Signature: ', props.deliveryData.Signature);
    if (props.deliveryData.Signature != '0') {
      //console.log('signature is not zero');
      async function getData() {
        const res = await axios.get(getImageUrl(props.deliveryData.TDLS_No, 2));
        setSignImage(res.data);
        if (res.data != '') {
          //console.log('there is something in sign');
        }
        //console.log(res.data);
      }
      getData();
    }
  }, []);

  // printing data format start

  let viePressUnit =
    props.deliveryData.vie_press_start_unit == null
      ? '\n'
      : props.deliveryData.vie_press_start_unit + '\n';
  let vieLevelUnit =
    props.deliveryData.vie_level_start_unit == null
      ? '\n' + '------------------------------------------------' + '\n'
      : props.deliveryData.vie_level_start_unit +
        '\n' +
        '------------------------------------------------' +
        '\n';
  let tankerPressUnit =
    props.deliveryData.tanker_press_start_unit == null
      ? '\n'
      : props.deliveryData.tanker_press_start_unit + '\n';
  let tankerLevelUnit =
    props.deliveryData.tanker_level_start_unit == null
      ? '\n'
      : props.deliveryData.tanker_level_start_unit + '\n';
  let contentUnit =
    props.deliveryData.content_start_unit == null
      ? '\n' + '------------------------------------------------' + '\n'
      : props.deliveryData.content_start_unit +
        '\n' +
        '------------------------------------------------' +
        '\n';
  let tdlsno =
    props.deliveryData.TDLS_No == null
      ? '\n'
      : props.deliveryData.TDLS_No + '\n';
  let scheduledate =
    props.deliveryData.ScheduledDate == null
      ? '\n'
      : props.deliveryData.ScheduledDate + '\n';
  let customerno =
    props.deliveryData.CustomerNo == null
      ? '\n'
      : props.deliveryData.CustomerNo + '\n';
  let customername =
    props.deliveryData.CustomerName == null
      ? '\n'
      : props.deliveryData.CustomerName + '\n';
  let primaryproduct =
    props.deliveryData.PrimaryProduct == null
      ? '\n'
      : props.deliveryData.PrimaryProduct + '\n';
  let productname =
    props.deliveryData.ProductName == null
      ? '\n'
      : props.deliveryData.ProductName + '\n';
  let vehiclenum =
    props.deliveryData.vehicleno == null
      ? '\n'
      : props.deliveryData.vehicleno + '\n';
  let decantername =
    props.deliveryData.DecanterName == null
      ? '\n'
      : props.deliveryData.DecanterName + '\n';
  let drivername =
    props.deliveryData.DriverName == null
      ? '\n'
      : props.deliveryData.DriverName + '\n';
  let timein =
    props.deliveryData.datein == null ? '\n' : props.deliveryData.datein + '\n';
  let inodometer =
    props.deliveryData.odometerin == null
      ? '\n'
      : props.deliveryData.odometerin + '\n';
  let timeout =
    props.deliveryData.dateout == null
      ? '\n'
      : props.deliveryData.dateout + '\n';
  let chk = '';
  let outodometer =
    props.deliveryData.odometerout == null
      ? '\n' + '------------------------------------------------' + '\n'
      : props.deliveryData.odometerout +
        '\n' +
        '------------------------------------------------' +
        '\n';
  let netweight =
    props.deliveryData.CalculationBaseTypeID == 1 ||
    props.deliveryData.tanker_content_diff == null
      ? '\n'
      : props.deliveryData.tanker_content_diff + ' KG' + '\n';
  let deliveredvolume =
    props.deliveryData.tanker_content_diff == null
      ? '\n'
      : props.deliveryData.tanker_content_diff + ' M3' + '\n';
  let comments =
    props.deliveryData.Additional_Remarks == null
      ? '\n'
      : props.deliveryData.Additional_Remarks + '\n';
  let viePressStart =
    props.deliveryData.vie_press_start == null
      ? ''
      : props.deliveryData.vie_press_start.toString();
  let viePressEnd =
    props.deliveryData.vie_press_end == null
      ? ''
      : props.deliveryData.vie_press_end.toString();
  let vieLevelStart =
    props.deliveryData.vie_level_start == null
      ? ''
      : props.deliveryData.vie_level_start.toString();
  let vieLevelEnd =
    props.deliveryData.vie_level_end == null
      ? ''
      : props.deliveryData.vie_level_end.toString();
  let tankerPressStart =
    props.deliveryData.tanker_press_start == null
      ? ''
      : props.deliveryData.tanker_press_start.toString();
  let tankerPressEnd =
    props.deliveryData.tanker_press_end == null
      ? ''
      : props.deliveryData.tanker_press_end.toString();
  let tankerLevelStart =
    props.deliveryData.tanker_level_start == null
      ? ''
      : props.deliveryData.tanker_level_start.toString();
  let tankerLevelEnd =
    props.deliveryData.tanker_level_end == null
      ? ''
      : props.deliveryData.tanker_level_end.toString();
  let contentStart =
    props.deliveryData.tanker_content_start == null
      ? ''
      : props.deliveryData.tanker_content_start.toString();
  let contentEnd =
    props.deliveryData.tanker_content_end == null
      ? ''
      : props.deliveryData.tanker_content_end.toString();

  // printing data format end

  return (
    <View style={styles.header}>
      <View style={styles.headerView}>
        <Text style={styles.headerText}>{props.title}</Text>
      </View>
      {props.deliveryData.Trip_Status != 1 &&
      props.deliveryData.Trip_Status != 3 ? (
        <TouchableOpacity
          style={styles.icon}
          onPress={() => {
            console.log('sign image: ', signImage);
            ToastExample.show(
              viePressStart,
              viePressEnd,
              viePressUnit,
              vieLevelStart,
              vieLevelEnd,
              vieLevelUnit,
              tankerPressStart,
              tankerPressEnd,
              tankerPressUnit,
              tankerLevelStart,
              tankerLevelEnd,
              tankerLevelUnit,
              contentStart,
              contentEnd,
              contentUnit,
              tdlsno,
              scheduledate,
              customername,
              customerno,
              primaryproduct,
              productname,
              vehiclenum,
              decantername,
              drivername,
              timein,
              timeout,
              inodometer,
              outodometer,
              chk,
              netweight,
              deliveredvolume,
              comments,
              signImage,
              err => {
                alert(err);
              },
              message => {
                alert(message);
              },
            );
          }}>
          <Icon name="printer" size={25} color="#077caa" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexWrap: 'nowrap',
  },
  headerText: {
    fontSize: 20,
  },
  headerView: {
    marginRight: '15%',
  },
  icon: {
    position: 'absolute',
    right: 0,
  },
});

export default Header;
