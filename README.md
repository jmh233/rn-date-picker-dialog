# rn-date-picker-dialog

A customizable and smooth date picker dialog component for React Native (Expo) applications.

## Features

- Smooth scroll experience with automatic centering
- Customizable min/max date range
- iOS-style picker interface
- Customizable selection indicator background color
- **Internationalization (i18n) support** - Built-in support for Chinese and English
- TypeScript support
- Works with both Expo and pure React Native projects

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
npm install react react-native
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
| `locale` | `'zh-CN' \| 'en-US'` | No | `'zh-CN'` | Locale for internationalization |
| `confirmText` | `string` | No | - | Custom text for confirm button (overrides locale default) |
| `cancelText` | `string` | No | - | Custom text for cancel button (overrides locale default) |
| `confirmTextColor` | `string` | No | `'#8066D0'` | Color for confirm button text |
| `cancelTextColor` | `string` | No | `'#828897'` | Color for cancel button text |
| `selectionBackgroundColor` | `string` | No | `'#F0EDF8'` | Background color of the selection indicator |
| `i18n` | `Partial<DatePickerI18n>` | No | - | Custom i18n configuration (advanced) |
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

### Internationalization (i18n)

#### English Locale

```tsx
<DatePickerDialog
  visible={isVisible}
  locale="en-US"
  onConfirm={(date) => {
    console.log('Selected:', date);
    setIsVisible(false);
  }}
  onCancel={() => setIsVisible(false)}
  onDismiss={() => setIsVisible(false)}
/>
```

**English format displays:**
- Years: `2024`
- Months: `Jan`, `Feb`, `Mar`, etc.
- Days: `01`, `02`, `03`, etc.

#### Chinese Locale (Default)

```tsx
<DatePickerDialog
  visible={isVisible}
  locale="zh-CN"  // This is the default, can be omitted
  onConfirm={(date) => {
    console.log('Selected:', date);
    setIsVisible(false);
  }}
  onCancel={() => setIsVisible(false)}
  onDismiss={() => setIsVisible(false)}
/>
```

**Chinese format displays:**
- Years: `2024年`
- Months: `01月`, `02月`, etc.
- Days: `01日`, `02日`, etc.

#### Custom Button Text and Colors

```tsx
<DatePickerDialog
  visible={isVisible}
  locale="en-US"
  confirmText="OK"
  cancelText="Close"
  confirmTextColor="#007AFF"
  cancelTextColor="#999999"
  selectionBackgroundColor="#E3F2FD"
  onConfirm={(date) => {
    console.log('Selected:', date);
    setIsVisible(false);
  }}
  onCancel={() => setIsVisible(false)}
  onDismiss={() => setIsVisible(false)}
/>
```

#### Advanced: Custom i18n Configuration

```tsx
import { DatePickerDialog } from 'rn-date-picker-dialog';

<DatePickerDialog
  visible={isVisible}
  locale="en-US"
  i18n={{
    yearSuffix: ' Year',
    monthSuffix: ' Month',
    daySuffix: ' Day',
    // Or use custom month names
    monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  }}
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
