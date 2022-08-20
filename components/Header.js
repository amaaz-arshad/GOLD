import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

function Header({navigation, title}) {
  return (
    <View style={styles.header}>
      <Icon
        style={styles.icon}
        name="menu"
        size={25}
        onPress={() => navigation.toggleDrawer()}
      />
      <View>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
  },
  icon: {
    position: 'absolute',
    left: 0,
  },
});

export default Header;
