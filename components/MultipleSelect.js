import React, {Component, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import axios from 'axios';

export default function MultipleSelect(props) {
  const [items, setItems] = useState([]);
  let arr = [];
  useEffect(() => {
    async function getData() {
      const response = await axios.get(
        'https://bulkscheduling.pakoxygen.com/api/Delivery/getRemarksMaster',
      );
      setItems(response.data);
      console.log(response.data);
      console.log('items: ', items);
    }
    getData();
    props.selectedRemarks.map(element => {
      console.log('abcd: ', element.RemarksMasterID);
      arr.push(element.RemarksMasterID);
    });
  }, []);

  const [selectedItems, setSelectedItems] = useState(arr);

  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  return (
    <View>
      <MultiSelect
        hideTags
        items={items}
        uniqueKey="RemarksMasterID"
        ref={component => {
          MultiSelect.multiSelect = component;
        }}
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        selectText="Select Remarks"
        searchInputPlaceholderText="Search Remarks..."
        onChangeInput={text => console.log(text)}
        altFontFamily="ProximaNova-Light"
        tagRemoveIconColor="#077caa"
        tagBorderColor="#077caa"
        tagTextColor="#077caa"
        selectedItemTextColor="#077caa"
        selectedItemIconColor="#077caa"
        itemTextColor="#000"
        displayKey="Remarks"
        searchInputStyle={{color: '#000'}}
        submitButtonColor="#077caa"
        submitButtonText="Submit"
        hideDropdown={false}
        hideSubmitButton={false}
        styleDropdownMenu={{
          borderWidth: 0.6,
          borderColor: 'gray',
          paddingLeft: 10,
          height: 50,
        }}
      />
      <Text>
        {selectedItems.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  titleText: {
    padding: 8,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headingText: {
    padding: 15,
  },
});
