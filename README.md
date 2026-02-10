# rn-date-picker-dialog

A customizable and smooth date picker dialog component for React Native (Expo) applications.

## Features

- Smooth scroll experience with automatic centering
- Customizable min/max date range
- iOS-style picker interface
- Beautiful gradient selection indicator
- TypeScript support
- Works seamlessly with Expo projects

## Installation

```bash
npm install rn-date-picker-dialog
```

or with yarn:

```bash
yarn add rn-date-picker-dialog
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install expo-linear-gradient react react-native
```

## Usage

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { DatePickerDialog } from 'rn-date-picker-dialog';

export default function App() {
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View>
      <Button
        title="Select Date"
        onPress={() => setVisible(true)}
      />

      <DatePickerDialog
        visible={visible}
        initialDate={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          console.log('Selected date:', date);
        }}
        onCancel={() => setVisible(false)}
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}
```

## API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | Yes | - | Controls the visibility of the picker dialog |
| `initialDate` | `Date` | No | `new Date()` | The initial date to display |
| `minDate` | `Date` | No | `new Date(1945, 0, 1)` | The minimum selectable date |
| `maxDate` | `Date` | No | `new Date()` (today) | The maximum selectable date |
| `onConfirm` | `(date: Date) => void` | No | - | Callback when user confirms date selection |
| `onCancel` | `() => void` | No | - | Callback when user cancels selection |
| `onDismiss` | `() => void` | No | - | Callback when dialog is dismissed |

## Examples

### Basic Usage

```tsx
<DatePickerDialog
  visible={isVisible}
  onConfirm={(date) => {
    console.log('Selected:', date);
    setIsVisible(false);
  }}
  onCancel={() => setIsVisible(false)}
  onDismiss={() => setIsVisible(false)}
/>
```

### With Date Range

```tsx
<DatePickerDialog
  visible={isVisible}
  initialDate={new Date(2024, 0, 1)}
  minDate={new Date(2020, 0, 1)}
  maxDate={new Date(2025, 11, 31)}
  onConfirm={(date) => {
    console.log('Selected:', date);
    setIsVisible(false);
  }}
  onCancel={() => setIsVisible(false)}
  onDismiss={() => setIsVisible(false)}
/>
```

## Compatibility

- React Native >= 0.60.0
- Expo SDK >= 47
- TypeScript >= 4.0

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues, please report them at: https://github.com/jmh233/rn-date-picker-dialog/issues

## Author

Jimmy
