import React from 'react';
import {StyleSheet, View, ImageBackground} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/AntDesign';
import {
  useTheme,
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
} from 'react-native-paper';
import {AuthContext} from '../components/context';
import NetInfo from '@react-native-community/netinfo';

export default function DrawerContent(props) {
  const {logout} = React.useContext(AuthContext);
  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        contentContainerStyle={{
          paddingTop: 0,
        }}
        {...props}>
        <ImageBackground
          source={require('../assets/drawer_bg.png')}
          style={styles.bgimage}></ImageBackground>
        <View style={styles.userInfoSection}>
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 4,
              borderColor: 'white',
              alignItems: 'center',
            }}>
            <Icon1
              name="user"
              color="white"
              size={70}
              style={{
                bottom: 0,
                position: 'absolute',
              }}
            />
          </View>
          <View>
            <Title style={styles.title}>{props.loginArr.UserName}</Title>
          </View>
        </View>
        {props.loginArr.LoginCategoryID == '2' ? (
          <View>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="clipboard-list-outline" color={color} size={size} />
              )}
              label="Decentre Delivery List"
              onPress={() => {
                props.navigation.navigate('DecentreDeliveryList');
              }}
            />
          </View>
        ) : null}

        {props.loginArr.LoginCategoryID == '1' ? (
          <View>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="clipboard-list-outline" color={color} size={size} />
              )}
              label="Schedular Delivery List"
              onPress={() => {
                props.navigation.navigate('SchedularDeliveryList');
              }}
            />
          </View>
        ) : null}
        <View>
          <DrawerItem
            icon={({color, size}) => (
              <Icon name="bell-outline" color={color} size={size} />
            )}
            label="Notifications"
            onPress={() => {
              props.navigation.navigate('Notifications');
            }}
          />
        </View>
        <Drawer.Section>
          <DrawerItem
            icon={({color, size}) => (
              <Icon name="sync" color={color} size={size} />
            )}
            label="Sync with GOLD"
            onPress={() => {
              NetInfo.fetch().then(state => {
                if (state.isConnected == true) {
                  alert('Data Synced');
                  props.loginArr.LoginCategoryID == '1'
                    ? props.navigation.navigate('SchedularDeliveryList')
                    : props.navigation.navigate('DecentreDeliveryList');
                } else {
                  alert('Data cannot be synced in offline mode.');
                }
              });
            }}
          />
        </Drawer.Section>
      </DrawerContentScrollView>

      <View>
        <DrawerItem
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Logout"
          onPress={() => {
            props.navigation.toggleDrawer();
            logout();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgimage: {
    paddingVertical: 100,
    marginBottom: 10,
    opacity: 0.6,
    backgroundColor: 'black',
    zIndex: 0,
  },
  userInfoSection: {
    position: 'absolute',
    top: 40,
    paddingLeft: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    marginTop: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});
