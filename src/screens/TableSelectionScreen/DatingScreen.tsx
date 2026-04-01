import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import IconButton from '../../components/Dating/IconButton';

import AgeRangeSlider from '../../components/Dating/AgeRangeSelector';

// Button data array
const BUTTONS = [
  {id: 1, iconName: 'home', text: 'home', color: '#DDDDDD'},
  {id: 2, iconName: 'star', text: 'Pass', color: '#DDDDDD'},
  {id: 3, iconName: 'star', text: 'Super Like', color: '#DDDDDD'},
  {id: 4, iconName: 'star', text: 'Profile', color: '#DDDDDD'},
  {id: 5, iconName: 'comment', text: 'Message', color: '#DDDDDD'},
];

export function DatingScreen() {
  const handlePress = (text: string) => {};
  const handleAgeRangeChange = (min: number, max: number) => {};
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.title}>About Me</Text>
        <View style={styles.buttonContainer}>
          {BUTTONS.map(btn => (
            <IconButton
              key={btn.id}
              iconName={btn.iconName}
              text={btn.text}
              onPress={() => handlePress(btn.text)}
              style={[styles.buttonStyle, {backgroundColor: btn.color}]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  subContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // allows wrapping to new row
    // justifyContent: 'center',
  },
  buttonStyle: {
    margin: 6,
    // minWidth: 110, // control minimum width
  },
});
