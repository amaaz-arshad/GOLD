import React from 'react';
import {StyleSheet, Text, View, ImageBackground, StatusBar} from 'react-native';

export default function Splash() {
  return (
    <ImageBackground
      source={require('../assets/gold_bg_logo.jpeg')}
      style={styles.bgimage}>
      <StatusBar backgroundColor="#077caa" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgimage: {
    width: '100%',
    height: '100%',
  },
});
