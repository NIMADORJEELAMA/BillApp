import {View, Text} from 'react-native';

import Warningicon from './src/assets/Icons/warning.svg';
import SuccessIcon from './src/assets/Icons/checkSuccess.svg';

const toastConfig = {
  success: internalProps => (
    <View
      style={[
        styles.toastContainer,
        {backgroundColor: internalProps.props?.backgroundColor || '#2e3134'},
      ]}>
      {/* Icon at the front */}
      <SuccessIcon
        height={26}
        width={26}
        stroke={'#ffffff'}
        // style={styles.iconStyle}
      />

      <View style={styles.textContainer}>
        <Text style={styles.text1Style}>{internalProps.text1}</Text>
        {internalProps.text2 && (
          <Text style={styles.text2Style}>{internalProps.text2}</Text>
        )}
      </View>
    </View>
  ),

  error: internalProps => (
    <View style={[styles.toastContainer, {backgroundColor: '#EA0000'}]}>
      <Warningicon height={20} width={20} />

      <View style={styles.textContainer}>
        <Text style={styles.text1Style}>{internalProps.text1}</Text>
        {internalProps.text2 && (
          <Text style={styles.text2Style}>{internalProps.text2}</Text>
        )}
      </View>
    </View>
  ),
};

const styles = {
  toastContainer: {
    width: '90%',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row', // Keeps Icon and Text Side-by-Side
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconStyle: {
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column', // Stacks text1 and text2 vertically
    flex: 1,
    marginLeft: 10,
  },
  text1Style: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  text2Style: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 1,
  },
};

export default toastConfig;
