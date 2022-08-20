import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import RNSketchCanvas from '@terrylinla/react-native-sketch-canvas';
import RNFS from 'react-native-fs';
import Orientation from 'react-native-orientation';

const windowWidth = Dimensions.get('window').height;
//let windowHeight = Dimensions.get('window').height;

export default function SignatureCanvas({ navigation, route }) {
  useEffect(() => {
    Orientation.lockToLandscape();
  }, []);
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <RNSketchCanvas
          containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
          canvasStyle={{ backgroundColor: 'transparent', flex: 1 }}
          defaultStrokeIndex={0}
          defaultStrokeWidth={7}
          closeComponent={
            <View style={styles.closeButton}>
              <Text style={{ color: 'white' }}>CLOSE</Text>
            </View>
          }
          onClosePressed={() => {
            navigation.pop();
            Orientation.lockToPortrait();
          }}
          clearComponent={
            <View style={styles.clearButton}>
              <Text style={{ color: 'white' }}>CLEAR</Text>
            </View>
          }
          saveComponent={
            <View style={styles.saveButton}>
              <Text style={{ color: 'white' }}>SAVE</Text>
            </View>
          }
          // undoComponent={
          //   <View style={styles.functionButton}>
          //     <Text style={{ color: 'white' }}>Undo</Text>
          //   </View>
          // }

          // eraseComponent={
          //   <View style={styles.functionButton}>
          //     <Text style={{color: 'white'}}>Eraser</Text>
          //   </View>
          // }
          // strokeComponent={color => (
          //   <View
          //     style={[{backgroundColor: color}, styles.strokeColorButton]}
          //   />
          // )}
          // strokeSelectedComponent={(color, index, changed) => {
          //   return (
          //     <View
          //       style={[
          //         {backgroundColor: color, borderWidth: 2},
          //         styles.strokeColorButton,
          //       ]}
          //     />
          //   );
          // }}
          // strokeWidthComponent={w => {
          //   return (
          //     <View style={styles.strokeWidthButton}>
          //       <View
          //         style={{
          //           backgroundColor: 'white',
          //           marginHorizontal: 2.5,
          //           width: Math.sqrt(w / 3) * 10,
          //           height: Math.sqrt(w / 3) * 10,
          //           borderRadius: (Math.sqrt(w / 3) * 10) / 2,
          //         }}
          //       />
          //     </View>
          //   );
          // }}

          savePreference={() => {
            return {
              folder: 'RNSketchCanvas',
              filename: 'SignatureImage',
              transparent: false,
              imageType: 'jpg',
              includeImage: true,
              includeText: false,
              cropToImageSize: true,
            };
          }}
          onSketchSaved={(success, filePath) => {
            //alert('success: ' + success + ', Filepath: ' + filePath);
            RNFS.readFile(filePath, 'base64').then(res => {
              navigation.goBack();
              // route.params.parentCallback(`data:image/png;base64,${res}`);
              route.params.parentCallback(`${res}`);
              Orientation.lockToPortrait();
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#39579A',
  },
  closeButton: {
    width: windowWidth / 2.99,
    height: 45,
    backgroundColor: 'rgb(194, 7, 7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    width: windowWidth / 2.99,
    height: 45,
    backgroundColor: '#80868b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: windowWidth / 2.99,
    height: 45,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
