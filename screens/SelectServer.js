import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';

export default function SelectServer({navigation, route}) {
  const [server, setServer] = useState(route.params.server);
  return (
    <View style={styles.container}>
      <Text style={styles.txt}>Select Server</Text>
      <View style={styles.pickerView}>
        <Picker
          style={styles.picker}
          selectedValue={server}
          onValueChange={itemValue => setServer(itemValue)}>
          <Picker.Item label="Test" value="Test" />
          <Picker.Item label="Production" value="Production" />
        </Picker>
      </View>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
          route.params.parentCallback(server);
        }}>
        <View style={styles.button}>
          <Text style={styles.btntxt}>Done</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  txt: {
    fontSize: 16,
    paddingBottom: 10,
  },
  picker: {
    width: '100%',
  },
  pickerView: {
    borderWidth: 0.6,
    borderColor: 'black',
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
});
