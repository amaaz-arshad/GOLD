import React, {useState, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {RadioButton} from 'react-native-paper';
import DeliveryCard from '../components/DeliveryCard';
import Icon from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Moment from 'moment';
import {format} from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import LocationSwitch from 'react-native-location-permission';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import LocationEnabler from 'react-native-location-enabler';
import AsyncStorage from '@react-native-async-storage/async-storage';

function DeliveryList(props) {
  //const postUrl = 'https://webhook.site/b4a73f8e-bf83-44a0-a001-f41d59febe98';

  const postUrl =
    'https://bulkscheduling.pakoxygen.com/api/Delivery/setDelivery';

  const {
    PRIORITIES: {HIGH_ACCURACY},
    useLocationSettings,
  } = LocationEnabler;

  const [DeliveryListData, setDeliveryListData] = useState([]);
  const [newListData, setNewListData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [locEn, setLocEn] = useState();
  // LocationSwitch.isLocationEnabled(
  //   () => {
  //     setLocEn(true);
  //   },
  //   () => {
  //     setLocEn(false);
  //   },
  // );

  const [enabled, requestResolution] = useLocationSettings(
    {
      priority: HIGH_ACCURACY, // default BALANCED_POWER_ACCURACY
      alwaysShow: true, // default false
      needBle: true, // default false
    },
    false /* optional: default undefined */,
  );

  // const [isLocationEnabled, setIsLocationEnabled] = useState();

  const [pickerValue, setPickerValue] = useState();
  const [checked, setChecked] = useState('allPending');

  const [fromDate, setFromDate] = useState(new Date());
  const [fromMode, setFromMode] = useState('fromDate');
  const [fromShow, setFromShow] = useState(false);
  const [toDate, setToDate] = useState(new Date());
  const [toMode, setToMode] = useState('toDate');
  const [toShow, setToShow] = useState(false);

  const onToChange = (event, selectedToDate) => {
    const currentToDate = selectedToDate || toDate;
    setToShow(Platform.OS === 'ios');
    setToDate(currentToDate);
  };

  const onFromChange = (event, selectedFromDate) => {
    const currentFromDate = selectedFromDate || fromDate;
    setFromShow(Platform.OS === 'ios');
    setFromDate(currentFromDate);
  };

  const showToMode = currentToMode => {
    setToShow(true);
    setToMode(currentToMode);
  };

  const showFromMode = currentFromMode => {
    setFromShow(true);
    setFromMode(currentFromMode);
  };

  const showToDatepicker = () => {
    showToMode('toDate');
  };

  const showFromDatepicker = () => {
    showFromMode('fromDate');
  };

  const [refreshPage, setRefreshPage] = useState(0);

  function loadingData() {
    NetInfo.fetch().then(state => {
      if (state.isConnected == true) {
        console.log('loading data from api...');
        axios
          .get(
            props.loginArr.LoginCategoryID == 1
              ? `https://bulkscheduling.pakoxygen.com/api/Delivery/getSchedulerList_DateAndAll?userid=${props.loginArr.LoginId}&From=&To=`
              : `https://bulkscheduling.pakoxygen.com/api/Delivery/getDecanterList_DateAndAll?userid=${props.loginArr.LoginId}&From=&To=`,
          )
          .then(function (response) {
            console.log(response);
            if (response.status == 200) {
              setIsLoading(false);
              setDeliveryListData(response.data);
              // setNewListData(response.data);
              console.log('from api: ', response.data);

              if (props.loginArr.LoginCategoryID == '1') {
                addSDLData(response.data);
                // getSDLData();
              } else if (props.loginArr.LoginCategoryID == '2') {
                addDDLData(response.data);
                // getDDLData();
              }
            } else {
              console.log('loading data from local storage...');
              if (props.loginArr.LoginCategoryID == '1') {
                getSDLData();
              } else if (props.loginArr.LoginCategoryID == '2') {
                getDDLData();
              }
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        console.log('loading data from local storage...');
        if (props.loginArr.LoginCategoryID == '1') {
          getSDLData();
        } else if (props.loginArr.LoginCategoryID == '2') {
          getDDLData();
        }
        //console.warn('No Internet Connection. Running app in offline mode.');
      }
    });
  }

  useEffect(() => {
    loadingData();
    // .then(() => {
    //   RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
    //     interval: 10000,
    //     fastInterval: 5000,
    //   })
    //     .then(data => {})
    //     .catch(err => {});
    // });
  }, []);

  // useEffect(() => {
  //   const unsubscribe = props.navigation.addListener('focus', () => {
  //     // The screen is focused
  //     // Call any action
  //     console.log('screen is focused');
  //     loadingData();
  //   });

  //   // Return the function to unsubscribe from the event so it gets removed on unmount
  //   return unsubscribe;
  // }, [props.navigation]);

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
                      console.log('Pending form Submitted successfully.');
                    } else {
                      console.log('Pending forms submission failed.');
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

  function getAllPendingData() {
    setChecked('allPending');
    loadingData();
  }

  const Submit = () => {
    async function getData() {
      const response = await axios.get(
        props.loginArr.LoginCategoryID == '1'
          ? `https://bulkscheduling.pakoxygen.com/api/Delivery/getSchedulerList_DateAndAll?userid=${
              props.loginArr.LoginId
            }&From=${format(fromDate, 'yyyy-MM-dd')}&To=${format(
              fromDate,
              'yyyy-MM-dd',
            )}`
          : `https://bulkscheduling.pakoxygen.com/api/Delivery/getDecanterList_DateAndAll?userid=${
              props.loginArr.LoginId
            }&From=${format(fromDate, 'yyyy-MM-dd')}&To=${format(
              fromDate,
              'yyyy-MM-dd',
            )}`,
      );
      console.log('from date:', format(fromDate, 'yyyy-MM-dd'));
      console.log('to date:', format(toDate, 'yyyy-MM-dd'));
      setIsLoading(false);
      setDeliveryListData(response.data);
      // setNewListData(response.data);
      console.log(response.data);
    }
    getData();
  };

  function getUnique(array, key) {
    if (typeof key !== 'function') {
      const property = key;
      key = function (item) {
        return item[property];
      };
    }
    return Array.from(
      array
        .reduce(function (map, item) {
          const k = key(item);
          if (!map.has(k)) map.set(k, item);
          return map;
        }, new Map())
        .values(),
    );
  }

  function addSDLData(data) {
    //firestore().collection('DL').doc('SDL').set({data});
    firestore().collection('SDL').doc(`${props.loginArr.LoginId}`).set({data});
    // try {
    //   await AsyncStorage.setItem(
    //     `SDL_${props.loginArr.LoginId}`,
    //     JSON.stringify(data),
    //   );
    // } catch (e) {
    //   console.log(e);
    // }
    console.log('sdl data stored in local storage');
  }

  function addDDLData(data) {
    //firestore().collection('DL').doc('DDL').set({data});
    firestore().collection('DDL').doc(`${props.loginArr.LoginId}`).set({data});
    // try {
    //   await AsyncStorage.setItem(
    //     `DDL_${props.loginArr.LoginId}`,
    //     JSON.stringify(data),
    //   );
    // } catch (e) {
    //   console.log(e);
    // }
    console.log('ddl data stored in local storage');
  }

  async function getSDLData() {
    //const document = await firestore().collection('DL').doc('SDL').get();
    try {
      const document = await firestore()
        .collection('SDL')
        .doc(`${props.loginArr.LoginId}`)
        .get();
      // const document = JSON.parse(
      //   await AsyncStorage.getItem(`SDL_${props.loginArr.LoginId}`),
      // );
      // document._data.data
      setDeliveryListData(document._data.data);
      // setNewListData(response.data);
      setIsLoading(false);
      console.log('from local storage: ', document._data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getDDLData() {
    //const document = await firestore().collection('DL').doc('DDL').get();
    try {
      const document = await firestore()
        .collection('DDL')
        .doc(`${props.loginArr.LoginId}`)
        .get();
      // const document = JSON.parse(
      //   await AsyncStorage.getItem(`DDL_${props.loginArr.LoginId}`),
      // );
      setDeliveryListData(document._data.data);
      // setNewListData(response.data);
      setIsLoading(false);
      console.log('from local storage: ', document._data.data);

      // if (document !== null) {
      // We have data!!

      // }
    } catch (error) {
      console.log(error);
    }
  }

  function qwer() {
    return (
      // <View style={styles.loading}>
      //       <View style={{ backgroundColor: 'white', padding: 10, zIndex: 1 }}>
      //         <ActivityIndicator size='large' color="#1769e0" />
      //       </View>
      //     </View>
      <ActivityIndicator size="large" color="#1769e0" />
    );
  }

  const handleCallback = data => {
    setDeliveryListData(data);
    if (props.loginArr.LoginCategoryID == '1') {
      addSDLData(data);
    } else if (props.loginArr.LoginCategoryID == '2') {
      addDDLData(data);
    }
    console.log('child data on list page: ', data);
  };

  return (
    <View style={styles.container}>
      {/* <Button title="Retry" onPress={() => setRefreshPage(refreshPage + 1)} /> */}
      {!enabled && (
        <View style={styles.location}>
          <View style={styles.horizontal}>
            <Ionicons name="location-sharp" size={18} color="#077caa" />
            <Text style={styles.locText1}>We Can't Locate You!</Text>
          </View>

          <Text style={styles.locText2}>
            Please turn on the location services to help us locate you.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={requestResolution}>
            <Text style={styles.btnText}>TURN IT ON</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.container1}>
        <View style={styles.chkbox}>
          {/* <CheckBox value={true} />
          <Text style={{fontSize: 15, marginLeft: 5}}>
            All Pending Deliveries (TDLS)
          </Text> */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton
              color="#077caa"
              uncheckedColor="#077caa"
              value="allPending"
              status={checked === 'allPending' ? 'checked' : 'unchecked'}
              onPress={() => getAllPendingData()}
            />
            <Text style={{paddingRight: 10}}>All Pending Deliveries</Text>

            <RadioButton
              color="#077caa"
              uncheckedColor="#077caa"
              value="dateRange"
              status={checked === 'dateRange' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('dateRange')}
            />
            <Text>Date Range</Text>
          </View>
        </View>

        {/* <Button title="get SDL data" onPress={getSDLData} />
        <Button title="get DDL data" onPress={getDDLData} /> */}
        {/* <Button title="add data" onPress={addData} /> */}
        {checked == 'dateRange' ? (
          <View style={styles.searchDate}>
            <View style={styles.date}>
              <View style={styles.fromdate}>
                <View>
                  <Text>From</Text>
                </View>

                <TouchableOpacity onPress={showFromDatepicker}>
                  <View style={styles.datetime}>
                    <Text>{format(fromDate, 'dd-MM-yyyy')}</Text>
                    <Icon name="calendar" size={20} color="gray" />
                  </View>
                </TouchableOpacity>
              </View>

              {fromShow && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={fromDate}
                  mode={fromMode}
                  is24Hour={true}
                  display="default"
                  onChange={onFromChange}
                />
              )}

              <View style={styles.todate}>
                <View>
                  <Text>To</Text>
                </View>
                <TouchableOpacity onPress={showToDatepicker}>
                  <View style={styles.datetime}>
                    <Text>{format(toDate, 'dd-MM-yyyy')}</Text>
                    <Icon name="calendar" size={20} color="gray" />
                  </View>
                </TouchableOpacity>
              </View>

              {toShow && (
                <DateTimePicker
                  testID="dateTimePicker1"
                  value={toDate}
                  mode={toMode}
                  is24Hour={true}
                  display="default"
                  onChange={onToChange}
                />
              )}
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={Submit}>
              <Text style={{color: 'white'}}>SEARCH</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.pickerView}>
          <Picker
            style={styles.picker}
            selectedValue={pickerValue}
            onValueChange={itemValue => setPickerValue(itemValue)}>
            <Picker.Item label="Select Trip No" value="" />

            {getUnique(DeliveryListData, 'BTTR_No').map((val, index) => {
              if (props.status.includes(val.Trip_Status)) {
                return (
                  <Picker.Item
                    key={index}
                    label={val.BTTR_No.toString()}
                    value={val.BTTR_No.toString()}
                  />
                );
              }
            })}
          </Picker>
        </View>
      </View>
      {isLoading ? (
        // <Modal visible={isLoading} dismissable={true} style={{ width: 50, height: 50 }}>
        //   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

        //     <ActivityIndicator size='large' color="blue" />
        //   </View>
        // </Modal>
        <View style={styles.loading}>
          <View style={{backgroundColor: 'white', padding: 10, zIndex: 1}}>
            <ActivityIndicator size="large" color="#1769e0" />
          </View>
        </View>
      ) : (
        // <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        //   <ActivityIndicator size="large" color="#1769e0" />
        //   <Text style={{marginTop: 10, fontSize: 18}}>loading data</Text>
        // </View>
        <ScrollView>
          <View style={styles.container2}>
            {DeliveryListData.map(val => {
              if (
                (pickerValue == val.BTTR_No || pickerValue == '') &&
                props.status.includes(val.Trip_Status)
              ) {
                return (
                  <DeliveryCard
                    navigation={props.navigation}
                    key={val.$id}
                    deliveryData={val}
                    loginCategoryId={props.loginArr.LoginCategoryID}
                    parentCallBack={handleCallback}
                  />
                );
              }
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    zIndex: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#077caa',
    padding: 7,
    width: '31%',
    borderRadius: 20,
    textAlign: 'center',
  },
  btnText: {
    color: 'white',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  locText1: {
    marginLeft: 5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  locText2: {
    fontSize: 13,
    paddingTop: 6,
    paddingBottom: 10,
  },
  location: {
    backgroundColor: 'rgb(216, 237, 245)',
    padding: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container1: {
    padding: 15,
  },
  container2: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 5,
  },
  datetime: {
    padding: 10,
    borderWidth: 0.6,
    borderColor: 'grey',
    borderRadius: 3,
    width: 135,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input1: {
    padding: 7,
    borderWidth: 0.6,
    borderColor: 'grey',
    marginBottom: 15,
    borderRadius: 3,
  },
  searchDate: {
    marginBottom: 25,
  },
  searchBtn: {
    backgroundColor: '#077caa',
    padding: 8,
    alignItems: 'center',
    borderRadius: 25,
  },
  date: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginTop: 5,
  },
  fromdate: {
    alignItems: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todate: {
    alignItems: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    width: '100%',
  },
  pickerView: {
    borderWidth: 0.6,
    borderColor: 'black',
  },
  chkbox: {
    marginBottom: 10,
    // flexDirection: 'row',
    // alignItems: 'center',
  },
});

export default DeliveryList;
