import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const options = ['PSI', 'BAR'];
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;

export default function ModalPicker(props) {
  return (
    <TouchableOpacity
      onPress={() => props.changeModalVisibility(true)}
      style={styles.container}>
      <View
        style={[styles.modal, {width: Width - 50, height: Height / 2}]}></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
});
