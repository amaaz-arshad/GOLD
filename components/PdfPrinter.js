import React, {useState} from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  NativeModules,
  Platform,
  Text,
  View,
} from 'react-native';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';

export default function PdfPrinter() {
  const [selectedPrinter, setSelectedPrinter] = useState(null);

  async function printHTML() {
    await RNPrint.print({
      html: '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>',
    });
  }

  async function printPDF() {
    const results = await RNHTMLtoPDF.convert({
      html: '<h2>Pakistan Oxygen Limited</h2><hr /><p>TDLS #: 400004038</p><p>Date: 13-05-2021</p>  <p>Customer #: 3121135</p>   <p>Name: BROOKES PHARMA LABS LTD.</p> <p>Product Code: 6</p>  <p>Description: LIQUID OXYGEN</p> <p>Tanker #: TUD-541</p> <p>Decanter Name: Decanter Port qism</p><p>Driver Name: li & Co. port qism</p><br /> <p>Date & Time In: 2021-08-12</p> <p>Odometer In: 1000</p><p>Date & Time Out: 2021-08-12</p><p>Odometer Out: 1050</p>',
      fileName: 'test',
      base64: true,
    });
    await RNPrint.print({filePath: results.filePath});
  }

  async function printRemotePDF() {
    await RNPrint.print({
      filePath: 'https://graduateland.com/api/v2/users/jesper/cv',
    });
  }

  return (
    <View style={styles.container}>
      <Button onPress={printHTML} title="Print HTML" />
      <Button onPress={printPDF} title="Print PDF" />
      <Button onPress={printRemotePDF} title="Print Remote PDF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
