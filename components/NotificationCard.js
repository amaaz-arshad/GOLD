import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NotificationCard(props) {
  return (
    <View style={styles.card}>
      <View style={styles.horizontal}>
        <Text>{props.day}</Text>
        <Text>
          <Icon name="clock-outline" size={15} color="black" /> {props.time}
        </Text>
      </View>
      <View style={[styles.horizontal, {paddingTop: 10}]}>
        <View style={{marginRight: 5}}>
          <Icon name="bell-outline" size={50} color="black" />
        </View>

        <View style={{paddingRight: 60}}>
          <Text>{props.notification}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: '#fff',
    marginVertical: 6,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    // shadowColor: '#333',
    // shadowOpacity: 0.3,
    // shadowRadius: 2,
    padding: 15,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
