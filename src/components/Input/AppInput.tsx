import React, {useState} from 'react';
import {StyleSheet, View, Text, TextInput, TextInputProps} from 'react-native';

interface AppInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  containerStyle?: object;
}

const AppInput = ({
  label,
  required,
  containerStyle,
  style,
  ...props
}: AppInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocus, style]}
        onFocus={e => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    color: '#475569',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputFocus: {
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
});

export default AppInput;
