import React from 'react';
import {StyleSheet, Text, View, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import DeliveryForm from '../screens/DeliveryForm';
import DeliveryList from '../screens/DeliveryList';
import Notifications from '../screens/Notifications';
import Login from '../screens/Login';
import SelectServer from '../screens/SelectServer';
import Header from '../components/Header';
import FormHeader from '../components/FormHeader';
import Splash from '../screens/Splash';
import {AuthContext} from '../components/context';
import DrawerContent from '../components/DrawerContent';
import SignatureCanvas from '../screens/SignatureCanvas';

import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let userToken;
let selectedServer;
const AuthStack = createStackNavigator();
const Drawer = createDrawerNavigator();
const DDLStack = createStackNavigator();
const SDLStack = createStackNavigator();
const FormStack = createStackNavigator();
const NotficationStack = createStackNavigator();
const Tabs = createMaterialTopTabNavigator();

const SDLStackScreen = ({navigation}) => (
  <SDLStack.Navigator>
    <SDLStack.Screen
      name="DeliveryList"
      component={SDLTabsScreen}
      options={{
        headerStyle: {
          borderBottomWidth: 0.6,
          borderBottomColor: 'black',
        },
        headerTitle: () => (
          <Header navigation={navigation} title="Delivery List (TDLS)" />
        ),
      }}
    />
    <SDLStack.Screen
      name="DeliveryForm"
      children={props => <DeliveryForm loginArr={userToken} {...props} />}
      options={
        ({route}) => ({
          headerStyle: {
            borderBottomWidth: 0.6,
            borderBottomColor: 'black',
          },
          headerTitle: () => (
            <FormHeader
              navigation={navigation}
              deliveryData={route.params.listData}
              title="Delivery Form (TDLS)"
            />
          ),
        })
        // headerTitleStyle: {
        //   fontWeight: 'bold',
        // },
      }
    />
    <SDLStack.Screen
      name="SignatureCanvas"
      component={SignatureCanvas}
      options={{
        headerShown: false,
      }}
    />
  </SDLStack.Navigator>
);

const DDLStackScreen = ({navigation}) => (
  <DDLStack.Navigator>
    <DDLStack.Screen
      name="DeliveryList"
      component={DDLTabsScreen}
      options={{
        headerStyle: {
          borderBottomWidth: 0.6,
          borderBottomColor: 'black',
        },
        headerTitle: () => (
          <Header navigation={navigation} title="Delivery List (TDLS)" />
        ),
      }}
    />
    <DDLStack.Screen
      name="DeliveryForm"
      children={props => <DeliveryForm loginArr={userToken} {...props} />}
      options={
        ({route}) => ({
          headerStyle: {
            borderBottomWidth: 0.6,
            borderBottomColor: 'black',
          },
          headerTitle: () => (
            <FormHeader
              navigation={navigation}
              deliveryData={route.params.listData}
              title="Delivery Form (TDLS)"
            />
          ),
        })
        // headerTitleStyle: {
        //   fontWeight: 'bold',
        // },
      }
    />
    <DDLStack.Screen
      name="SignatureCanvas"
      component={SignatureCanvas}
      options={{
        // headerStyle: {
        //   borderBottomWidth: 0.6,
        //   borderBottomColor: 'black',
        // },
        // headerTitleAlign: 'center',
        // headerTitle: 'Signature Canvas',
        headerShown: false,
      }}
    />
  </DDLStack.Navigator>
);

const NotficationStackScreen = ({navigation}) => (
  <NotficationStack.Navigator>
    <NotficationStack.Screen
      name="Notifications"
      component={Notifications}
      options={{
        headerStyle: {
          borderBottomWidth: 0.6,
          borderBottomColor: 'black',
        },
        headerTitle: () => (
          <Header navigation={navigation} title="Notifications" />
        ),
      }}
    />
  </NotficationStack.Navigator>
);

const SDLTabsScreen = () => (
  <Tabs.Navigator>
    <Tabs.Screen
      name="Pending"
      children={props => (
        <DeliveryList
          loginArr={userToken}
          selectedServer={selectedServer}
          status={[5]} // status="Submitted"
          {...props}
        />
      )}
    />
    <Tabs.Screen
      name="Approved"
      children={props => (
        <DeliveryList
          loginArr={userToken}
          selectedServer={selectedServer}
          status={[6]} // status="Approved"
          {...props}
        />
      )}
    />
    <Tabs.Screen
      name="Rejected"
      children={props => (
        <DeliveryList
          loginArr={userToken}
          selectedServer={selectedServer}
          status={[4]} // status="Closed"
          {...props}
        />
      )}
    />
  </Tabs.Navigator>
);

const DDLTabsScreen = () => (
  <Tabs.Navigator>
    <Tabs.Screen
      name="Pending"
      children={props => (
        <DeliveryList
          loginArr={userToken}
          selectedServer={selectedServer}
          status={[1, 3]} // status==1=="Scheduled" && status==3=='unblocked'
          {...props}
        />
      )}
    />
    <Tabs.Screen
      name="Submitted"
      children={props => (
        <DeliveryList
          loginArr={userToken}
          selectedServer={selectedServer}
          status={[5]} // status="Submitted"
          {...props}
        />
      )}
    />
  </Tabs.Navigator>
);

export default function Navigation() {
  const initialLoginState = {
    isLoading: true,
    userId: null,
    userToken: null,
    selectedServer: 'none',
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
          selectedServer: action.server,
        };
      case 'LOGIN':
        return {
          ...prevState,
          userId: action.id,
          userToken: action.token,
          isLoading: false,
          selectedServer: action.server,
        };
      case 'REGISTER':
        return {
          ...prevState,
          userId: action.id,
          userToken: action.token,
          isLoading: false,
          selectedServer: action.server,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userId: null,
          userToken: null,
          isLoading: false,
          selectedServer: 'none',
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const authContext = React.useMemo(
    () => ({
      login: async (userId, password, loginData, server) => {
        userToken = null;

        if (userId == loginData.LoginId && password == loginData.LoginPass) {
          try {
            userToken = loginData;
            selectedServer = server;
            await AsyncStorage.setItem('userToken', JSON.stringify(userToken));
            await AsyncStorage.setItem(
              'server',
              JSON.stringify(selectedServer),
            );
          } catch (e) {
            console.log(e);
          }
        }

        console.log('user token: ', userToken);
        console.log('selected server: ', selectedServer);
        dispatch({
          type: 'LOGIN',
          id: userId,
          token: userToken,
          server: selectedServer,
        });
      },
      logout: async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('server');
        } catch (e) {
          console.log(e);
        }
        console.log('user token: ', userToken);
        console.log('selected server: ', selectedServer);
        dispatch({type: 'LOGOUT'});
      },
    }),
    [],
  );

  const setNavigationColor = color => {
    changeNavigationBarColor(color);
  };

  setNavigationColor('black');

  React.useEffect(() => {
    setTimeout(async () => {
      // setIsLoading(false);

      userToken = null;
      selectedServer = 'none';
      try {
        userToken = JSON.parse(await AsyncStorage.getItem('userToken'));
        selectedServer = JSON.parse(await AsyncStorage.getItem('server'));
      } catch (e) {
        console.log(e);
      }
      console.log('user token: ', userToken);
      console.log('Selected Server: ', selectedServer);
      dispatch({type: 'LOGIN', token: userToken, server: selectedServer});
    }, 2000);
  }, []);

  if (loginState.isLoading) {
    return <Splash />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <StatusBar backgroundColor="#077caa" />
      <NavigationContainer>
        {loginState.userToken != null ? (
          <Drawer.Navigator
            drawerContent={props => (
              <DrawerContent loginArr={userToken} {...props} />
            )}>
            {userToken.LoginCategoryID == '1' ? (
              <Drawer.Screen
                name="SchedularDeliveryList"
                component={SDLStackScreen}
              />
            ) : null}
            {userToken.LoginCategoryID == '2' ? (
              <Drawer.Screen
                name="DecentreDeliveryList"
                component={DDLStackScreen}
              />
            ) : null}
            <Drawer.Screen
              name="Notifications"
              component={NotficationStackScreen}
            />
            <Drawer.Screen
              name="DeliveryForm"
              component={DeliveryForm}
              options={{
                swipeEnabled: false,
              }}
            />
            {/* <Drawer.Screen name="Login" component={Login} /> */}
          </Drawer.Navigator>
        ) : (
          <AuthStack.Navigator>
            <AuthStack.Screen
              name="Login"
              component={Login}
              options={{
                swipeEnabled: false,
                headerShown: false,
              }}
            />
            <AuthStack.Screen
              name="SelectServer"
              component={SelectServer}
              options={{
                headerStyle: {
                  borderBottomWidth: 0.6,
                  borderBottomColor: 'black',
                },
                headerTitleAlign: 'center',
                headerTitle: 'Select Server',
                swipeEnabled: false,
              }}
            />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({});
