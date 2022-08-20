import React from 'react';
import {StyleSheet, Text, View, ScrollView, FlatList} from 'react-native';
import NotificationCard from '../components/NotificationCard';
import NotificationData from '../datafiles/NotificationData';

export default function Notifications() {
  return (
    <ScrollView>
      <View style={styles.container}>
        {NotificationData.map((val, index) => {
          return (
            <NotificationCard
              key={index}
              day={val.day}
              time={val.time}
              notification={val.notification}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
});
