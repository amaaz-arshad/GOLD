import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AuthContext} from '../components/context';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {add} from 'date-fns';
import {resolvePlugin} from '@babel/core';

function Login({navigation}) {
  const [loginData, setLoginData] = React.useState([]);
  const [server, setServer] = React.useState('None');

  const {login} = React.useContext(AuthContext);

  // firestore().collection('login').doc('PK0342').set(schedular);
  // firestore().collection('login').doc('TUD-541').set(decanter);
  // try {
  //   await AsyncStorage.setItem('login_TUD541', JSON.stringify({decanter}));
  //   await AsyncStorage.setItem('login_PK0342', JSON.stringify({schedular}));
  // } catch (e) {
  //   console.log(e);
  // }

  // async function getLoginData(username) {
  //   // let data = await JSON.parse(AsyncStorage.getItem(`login_${username}`));
  //   const data = await firestore().collection('login').doc(`${username}`).get();
  //   console.log('aa', data._data);
  //   return data._data;
  // }

  const [data, setData] = React.useState({
    username: '',
    password: '',
    secureTextEntry: true,
    showIcon: false,
  });

  const textChangeInput = val => {
    setData({
      ...data,
      username: val,
    });
  };

  const handlePasswordChange = val => {
    setData({
      ...data,
      password: val,
      showIcon: val.length != 0 ? true : false,
    });
  };

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  function loginHandle(username, password) {
    console.log('username:', username);
    console.log('password:', password);
    NetInfo.fetch().then(state => {
      if (state.isConnected == true) {
        axios
          .get(
            `https://bulkscheduling.pakoxygen.com/api/Account/ValidateLogin?Username=${username}&Password=${password}`,
          )
          .then(response => {
            console.log(response);
            if (response.status == 200) {
              setLoginData(response.data);
              firestore()
                .collection('login')
                .doc(`${username}`)
                .set(response.data);
              if (response.data.ResultCode == 'S' && server != 'None') {
                login(username, password, response.data, server);
              } else if (server == 'None') {
                alert('Select a server first');
              } else {
                alert(response.data.ResultStatus);
              }
            } else {
              async function getLoginData() {
                let login_data = await firestore()
                  .collection('login')
                  .doc(`${username}`)
                  .get();
                console.log('login_data: ', login_data._data);
                if (
                  username == login_data._data.LoginId &&
                  password == login_data._data.LoginPass &&
                  server != 'None'
                ) {
                  console.log('login success');
                  login(username, password, login_data._data, server);
                } else if (server == 'None') {
                  alert('Select a server first');
                } else {
                  alert('Username or password is invalid.');
                }
              }
              getLoginData();
            }
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        // getting login data from database
        async function getLoginData() {
          let login_data = await firestore()
            .collection('login')
            .doc(`${username}`)
            .get();
          console.log('login_data: ', login_data._data);
          if (
            username == login_data._data.LoginId &&
            password == login_data._data.LoginPass &&
            server != 'None'
          ) {
            console.log('login success');
            login(username, password, login_data._data, server);
          } else if (server == 'None') {
            alert('Select a server first');
          } else {
            alert('Username or password is invalid.');
          }
        }
        getLoginData();
      }
    });
  }

  const handleCallback = response => {
    setServer(response);
  };

  return (
    //<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <Image source={require('../assets/pol_logo.jpeg')} style={styles.img} />
        <Text style={styles.txt1}>Sign in to</Text>
        <Text style={styles.txt2}>Your Account</Text>
        <View style={styles.inputSection}>
          <Text style={styles.txt3}>Login</Text>
          <View style={styles.inputField}>
            <TextInput
              style={styles.input}
              placeholder="User ID*"
              autoCapitalize="none"
              onChangeText={val => textChangeInput(val)}
            />
          </View>

          <View style={styles.inputField}>
            <TextInput
              style={styles.input}
              placeholder="Password*"
              secureTextEntry={data.secureTextEntry ? true : false}
              onChangeText={val => handlePasswordChange(val)}
            />
            <TouchableOpacity onPress={updateSecureTextEntry}>
              {data.showIcon ? (
                data.secureTextEntry ? (
                  <Icon name="eye" size={20} color="grey" />
                ) : (
                  <Icon name="eye-off" size={20} color="grey" />
                )
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            loginHandle(data.username, data.password);
          }}>
          <View style={styles.button}>
            <Text style={styles.btntxt}>Sign In</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.push('SelectServer', {
              server: server,
              parentCallback: handleCallback,
            });
          }}>
          <Text style={styles.settings}>Settings</Text>
        </TouchableOpacity>

        <View style={{paddingTop: 15}}>
          <Text style={{textAlign: 'center'}}>Server Selected: {server}</Text>
        </View>
      </KeyboardAwareScrollView>
      <View
        style={{
          flex: 0.2,
          alignSelf: 'center',
          justifyContent: 'flex-end',
          // position: 'absolute',
          // bottom: 20,
        }}>
        <Text style={styles.txtBottom}>Powered by Pakistan Oxygen Limited</Text>
      </View>
    </View>
    // </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputSection: {},
  settings: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 15,
    fontWeight: 'bold',
    color: '#1769e0',
  },
  button: {
    backgroundColor: '#0987b9',
    padding: 10,
    borderRadius: 35,
    marginTop: '10%',
  },
  btntxt: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 16,
  },
  input: {
    width: '90%',
  },
  inputField: {
    paddingHorizontal: 10,
    borderWidth: 0.6,
    borderColor: 'grey',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txt1: {
    fontSize: 22,
  },
  txt2: {
    fontSize: 35,
    paddingBottom: '10%',
  },
  txt3: {
    fontSize: 22,
    paddingBottom: 15,
  },
  txtBottom: {
    color: 'rgb(104, 104, 104)',
    fontSize: 15,
  },
  img: {
    width: 100,
    height: 100,
    marginTop: 5,
    marginBottom: 15,
  },
});

export default Login;
