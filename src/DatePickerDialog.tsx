/**
 * 日期选择器弹窗 - 与Flutter的PracticeDatePicker保持一致
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface DatePickerDialogProps {
  visible: boolean;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

const ITEM_HEIGHT = 46;
const VISIBLE_ITEM_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEM_COUNT;
const PADDING = ITEM_HEIGHT * 2;

interface PickerColumnState {
  scrollStopTimer: ReturnType<typeof setTimeout> | null;
  isAutoScrolling: boolean;
  centerIndex: number;
}

export const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  visible,
  initialDate,
  minDate = new Date(1945, 0, 1),
  maxDate,
  onConfirm,
  onCancel,
  onDismiss,
}) => {
  // 确保 maxDate 是今天，且时间设为 0:0:0:0
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // 确保 effectiveMaxDate 是今天，即使传入了 maxDate 也要确保不超过今天
  const effectiveMaxDate = useMemo(() => {
    if (maxDate) {
      const maxDateCopy = new Date(maxDate);
      maxDateCopy.setHours(0, 0, 0, 0);
      // 如果传入的 maxDate 超过今天，则使用今天
      return maxDateCopy > today ? today : maxDateCopy;
    }
    return today;
  }, [maxDate, today]);

  // 初始化状态，但会在 useEffect 中根据 initialDate 更新
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // 使用 useState 存储 centerIndex，确保更新时触发重新渲染
  const [yearCenterIndex, setYearCenterIndex] = useState<number>(0);
  const [monthCenterIndex, setMonthCenterIndex] = useState<number>(0);
  const [dayCenterIndex, setDayCenterIndex] = useState<number>(0);

  const yearColumnRef = useRef<ScrollView>(null);
  const monthColumnRef = useRef<ScrollView>(null);
  const dayColumnRef = useRef<ScrollView>(null);

  const yearColumnState = useRef<PickerColumnState>({
    scrollStopTimer: null,
    isAutoScrolling: false,
    centerIndex: 0,
  });

  const monthColumnState = useRef<PickerColumnState>({
    scrollStopTimer: null,
    isAutoScrolling: false,
    centerIndex: 0,
  });

  const dayColumnState = useRef<PickerColumnState>({
    scrollStopTimer: null,
    isAutoScrolling: false,
    centerIndex: 0,
  });

  // 用于跟踪是否正在初始化，防止同步 useEffect 在初始化时错误覆盖日期
  const isInitializing = useRef<boolean>(false);

  // 构建年份列表
  const buildYearList = useCallback((): number[] => {
    const start = minDate.getFullYear();
    const end = effectiveMaxDate.getFullYear();
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [minDate, effectiveMaxDate]);

  // 构建月份列表（根据选中的年份）
  const buildMonthList = useCallback((year: number): number[] => {
    const minMonth = year === minDate.getFullYear() ? minDate.getMonth() + 1 : 1;
    // 如果选中的年份是今年，最大月份只能是当前月份
    // 如果选中的年份超过今年，返回空数组（不应该发生，但做保护）
    let maxMonth = 12;
    if (year === effectiveMaxDate.getFullYear()) {
      maxMonth = effectiveMaxDate.getMonth() + 1;
    } else if (year > effectiveMaxDate.getFullYear()) {
      // 不应该发生，但做保护
      return [];
    }
    return Array.from({ length: maxMonth - minMonth + 1 }, (_, i) => minMonth + i);
  }, [minDate, effectiveMaxDate]);

  // 构建日期列表（根据选中的年月）
  const buildDayList = useCallback((year: number, month: number): number[] => {
    const totalDays = new Date(year, month, 0).getDate();
    let minDay = 1;
    let maxDay = totalDays;

    if (year === minDate.getFullYear() && month === minDate.getMonth() + 1) {
      minDay = minDate.getDate();
    }
    // 如果选中的年月是今年本月，最大日期只能是今天
    if (year === effectiveMaxDate.getFullYear() && month === effectiveMaxDate.getMonth() + 1) {
      maxDay = effectiveMaxDate.getDate();
    } else if (year > effectiveMaxDate.getFullYear() ||
               (year === effectiveMaxDate.getFullYear() && month > effectiveMaxDate.getMonth() + 1)) {
      // 如果选中的年月超过今天，返回空数组（不应该发生，但做保护）
      return [];
    }

    return Array.from({ length: maxDay - minDay + 1 }, (_, i) => minDay + i);
  }, [minDate, effectiveMaxDate]);

  const years = buildYearList();
  const months = buildMonthList(selectedYear);
  const days = buildDayList(selectedYear, selectedMonth);


  // 初始化日期和滚动位置
  useEffect(() => {
    if (visible) {
      // 设置初始化标志，防止同步 useEffect 在初始化时错误覆盖日期
      isInitializing.current = true;

      // 使用 initialDate prop，如果没有则使用今天
      const dateToUse = initialDate ? new Date(initialDate) : new Date(today);
      // 确保日期不超过今天
      const clampedDate = dateToUse > effectiveMaxDate ? effectiveMaxDate : dateToUse;

      // 确保日期不小于最小日期
      const finalDate = clampedDate < minDate ? minDate : clampedDate;

      const year = finalDate.getFullYear();
      const month = finalDate.getMonth() + 1;
      const day = finalDate.getDate();

      // 确保日期在有效范围内
      const clampedYear = Math.max(minDate.getFullYear(), Math.min(year, effectiveMaxDate.getFullYear()));
      const availableMonths = buildMonthList(clampedYear);
      const clampedMonth = availableMonths.length > 0 && availableMonths.includes(month) ? month : (availableMonths.length > 0 ? availableMonths[0] : 1);
      const availableDays = buildDayList(clampedYear, clampedMonth);

      // 确保日期在有效范围内，但保持原有逻辑不变
      let clampedDay: number;
      if (availableDays.length > 0 && availableDays.includes(day)) {
        // 日期在有效范围内，直接使用
        clampedDay = day;
      } else if (availableDays.length > 0) {
        // 日期不在有效范围内，选择最接近的有效日期
        // 如果初始日期大于最大可用日期，选择最大可用日期
        // 如果初始日期小于最小可用日期，选择最小可用日期
        if (day > availableDays[availableDays.length - 1]) {
          clampedDay = availableDays[availableDays.length - 1];
        } else if (day < availableDays[0]) {
          clampedDay = availableDays[0];
        } else {
          // 这种情况理论上不会发生，但做保护
          clampedDay = availableDays[0];
        }
      } else {
        clampedDay = 1;
      }

      setSelectedYear(clampedYear);
      setSelectedMonth(clampedMonth);
      setSelectedDay(clampedDay);

      // 延迟对齐，确保状态已更新和列表已生成
      // 需要等待状态更新后，列表重新计算
      const timer = setTimeout(() => {
        // 直接对齐到计算好的值，不依赖可能未更新的状态
        const alignToValue = (
          column: 'year' | 'month' | 'day',
          value: number,
          year: number,
          month: number
        ) => {
          const state = column === 'year' ? yearColumnState.current :
            column === 'month' ? monthColumnState.current :
              dayColumnState.current;
          const ref = column === 'year' ? yearColumnRef.current :
            column === 'month' ? monthColumnRef.current :
              dayColumnRef.current;

          if (!ref) return;

          let values: number[];
          if (column === 'year') {
            values = buildYearList();
          } else if (column === 'month') {
            values = buildMonthList(year);
          } else {
            values = buildDayList(year, month);
          }

          const index = values.indexOf(value);
          if (index === -1) return;

          const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
          const centerIndex = (VISIBLE_ITEM_COUNT - 1) / 2;
          const targetOffset = (clampedIndex - centerIndex) * ITEM_HEIGHT + PADDING;

          state.isAutoScrolling = true;
          state.centerIndex = clampedIndex;

          if (column === 'year') {
            setYearCenterIndex(clampedIndex);
          } else if (column === 'month') {
            setMonthCenterIndex(clampedIndex);
          } else {
            setDayCenterIndex(clampedIndex);
          }

          requestAnimationFrame(() => {
            if (ref) {
              ref.scrollTo({
                y: Math.max(0, targetOffset),
                animated: false,
              });
            }
          });

          setTimeout(() => {
            state.isAutoScrolling = false;
          }, 50);
        };

        alignToValue('year', clampedYear, clampedYear, clampedMonth);
        alignToValue('month', clampedMonth, clampedYear, clampedMonth);
        alignToValue('day', clampedDay, clampedYear, clampedMonth);

        // 初始化完成后，清除初始化标志
        setTimeout(() => {
          isInitializing.current = false;
        }, 200);
      }, 100);

      return () => {
        clearTimeout(timer);
        isInitializing.current = false;
      };
    }
  }, [visible, initialDate, minDate, effectiveMaxDate, buildMonthList, buildDayList, buildYearList, today]);

  // 同步月份（当年份改变时）
  useEffect(() => {
    if (!visible) return;
    // 如果正在初始化，不执行同步逻辑，避免覆盖初始化时设置的月份
    if (isInitializing.current) return;

    const availableMonths = buildMonthList(selectedYear);
    if (!availableMonths.includes(selectedMonth)) {
      const newMonth = availableMonths[0];
      setSelectedMonth(newMonth);
      // 延迟对齐，等待状态更新
      setTimeout(() => {
        alignColumnToSelection('month', true);
      }, 150);
    } else {
      // 即使月份在范围内，也要重新对齐（因为列表可能变化）
      setTimeout(() => {
        alignColumnToSelection('month', false);
      }, 50);
    }
  }, [selectedYear, visible, buildMonthList]);

  // 同步日期（当年份或月份改变时）
  useEffect(() => {
    if (!visible) return;
    // 如果正在初始化，不执行同步逻辑，避免覆盖初始化时设置的日期
    if (isInitializing.current) return;

    const availableDays = buildDayList(selectedYear, selectedMonth);
    if (!availableDays.includes(selectedDay)) {
      // 如果日期不在有效范围内，选择最接近的有效日期
      let newDay: number;
      if (selectedDay > availableDays[availableDays.length - 1]) {
        newDay = availableDays[availableDays.length - 1];
      } else if (selectedDay < availableDays[0]) {
        newDay = availableDays[0];
      } else {
        newDay = availableDays[0];
      }
      setSelectedDay(newDay);
      // 延迟对齐，等待状态更新
      setTimeout(() => {
        alignColumnToSelection('day', true);
      }, 150);
    } else {
      // 即使日期在范围内，也要重新对齐（因为列表可能变化）
      setTimeout(() => {
        alignColumnToSelection('day', false);
      }, 50);
    }
  }, [selectedYear, selectedMonth, visible, buildDayList]);

  // 对齐列到选中位置
  const alignColumnToSelection = useCallback((column: 'year' | 'month' | 'day', animate: boolean) => {
    const state = column === 'year' ? yearColumnState.current :
      column === 'month' ? monthColumnState.current :
        dayColumnState.current;
    const ref = column === 'year' ? yearColumnRef.current :
      column === 'month' ? monthColumnRef.current :
        dayColumnRef.current;

    if (!ref) return;

    // 使用最新的列表值，而不是组件顶层的值
    let values: number[];
    let selectedValue: number;

    if (column === 'year') {
      values = buildYearList();
      selectedValue = selectedYear;
    } else if (column === 'month') {
      values = buildMonthList(selectedYear);
      selectedValue = selectedMonth;
    } else {
      values = buildDayList(selectedYear, selectedMonth);
      selectedValue = selectedDay;
    }

    const index = values.indexOf(selectedValue);
    if (index === -1) {
      return;
    }

    state.centerIndex = index;

    // 更新 state 中的 centerIndex，触发重新渲染
    if (column === 'year') {
      setYearCenterIndex(index);
    } else if (column === 'month') {
      setMonthCenterIndex(index);
    } else {
      setDayCenterIndex(index);
    }

    scrollToIndex(column, index, animate);
  }, [selectedYear, selectedMonth, selectedDay, buildYearList, buildMonthList, buildDayList]);

  // 滚动到指定索引
  const scrollToIndex = (column: 'year' | 'month' | 'day', index: number, animate: boolean) => {
    const state = column === 'year' ? yearColumnState.current :
      column === 'month' ? monthColumnState.current :
        dayColumnState.current;
    const ref = column === 'year' ? yearColumnRef.current :
      column === 'month' ? monthColumnRef.current :
        dayColumnRef.current;

    if (!ref) {
      return;
    }

    // 获取当前列的值列表（使用最新的值）
    let values: number[];
    if (column === 'year') {
      values = buildYearList();
    } else if (column === 'month') {
      values = buildMonthList(selectedYear);
    } else {
      values = buildDayList(selectedYear, selectedMonth);
    }

    // 确保索引在有效范围内
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

    // 计算目标偏移量：让指定索引的项滚动到中心位置
    // 中心位置是第 3 项（索引 2，从 0 开始），所以需要滚动 (index - 2) * ITEM_HEIGHT
    // 加上上下填充 PADDING
    const centerIndex = (VISIBLE_ITEM_COUNT - 1) / 2; // 2
    const targetOffset = (clampedIndex - centerIndex) * ITEM_HEIGHT + PADDING;

    state.isAutoScrolling = true;
    state.centerIndex = clampedIndex; // 更新中心索引

    // 更新 state 中的 centerIndex，触发重新渲染
    if (column === 'year') {
      setYearCenterIndex(clampedIndex);
    } else if (column === 'month') {
      setMonthCenterIndex(clampedIndex);
    } else {
      setDayCenterIndex(clampedIndex);
    }

    // 使用 requestAnimationFrame 确保在下一帧执行滚动
    requestAnimationFrame(() => {
      if (ref) {
        ref.scrollTo({
          y: Math.max(0, targetOffset),
          animated: animate,
        });
      }
    });

    setTimeout(() => {
      state.isAutoScrolling = false;
    }, animate ? 400 : 50);
  };

  // 处理滚动事件
  const handleScroll = (column: 'year' | 'month' | 'day', event: any) => {
    const state = column === 'year' ? yearColumnState.current :
      column === 'month' ? monthColumnState.current :
        dayColumnState.current;

    if (state.isAutoScrolling) return;

    const offsetY = event.nativeEvent.contentOffset.y;
    // 计算中心位置的偏移量
    // 中心位置距离顶部 = offsetY + (可见区域高度 / 2) - 上填充
    const centerOffset = offsetY + (ITEM_HEIGHT * (VISIBLE_ITEM_COUNT - 1) / 2) - PADDING;

    let values: number[];
    if (column === 'year') {
      values = years;
    } else if (column === 'month') {
      values = months;
    } else {
      values = days;
    }

    const newIndex = Math.round(centerOffset / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(newIndex, values.length - 1));

    if (state.centerIndex !== clampedIndex) {
      state.centerIndex = clampedIndex;

      // 更新 state 中的 centerIndex，触发重新渲染
      if (column === 'year') {
        setYearCenterIndex(clampedIndex);
      } else if (column === 'month') {
        setMonthCenterIndex(clampedIndex);
      } else {
        setDayCenterIndex(clampedIndex);
      }

      applySelectionFromIndex(column, clampedIndex);
    }

    // 清除之前的定时器
    if (state.scrollStopTimer) {
      clearTimeout(state.scrollStopTimer);
    }

    // 设置新的定时器，滚动停止后自动对齐
    state.scrollStopTimer = setTimeout(() => {
      if (!state.isAutoScrolling) {
        autoCenter(column);
      }
    }, 150);
  };

  // 自动居中对齐
  const autoCenter = (column: 'year' | 'month' | 'day') => {
    const state = column === 'year' ? yearColumnState.current :
      column === 'month' ? monthColumnState.current :
        dayColumnState.current;
    scrollToIndex(column, state.centerIndex, true);
  };

  // 应用选中值
  const applySelectionFromIndex = (column: 'year' | 'month' | 'day', index: number) => {
    // 获取最新的值列表
    let values: number[];
    if (column === 'year') {
      values = buildYearList();
    } else if (column === 'month') {
      values = buildMonthList(selectedYear);
    } else {
      values = buildDayList(selectedYear, selectedMonth);
    }

    // 确保索引在有效范围内
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

    if (column === 'year') {
      const year = values[clampedIndex];
      if (year !== selectedYear) {
        setSelectedYear(year);
      }
    } else if (column === 'month') {
      const month = values[clampedIndex];
      if (month !== selectedMonth) {
        setSelectedMonth(month);
      }
    } else {
      const day = values[clampedIndex];
      if (day !== selectedDay) {
        setSelectedDay(day);
      }
    }
  };

  // 处理点击
  const handleItemPress = useCallback((column: 'year' | 'month' | 'day', index: number) => {
    const state = column === 'year' ? yearColumnState.current :
      column === 'month' ? monthColumnState.current :
        dayColumnState.current;

    // 清除之前的滚动停止定时器
    if (state.scrollStopTimer) {
      clearTimeout(state.scrollStopTimer);
      state.scrollStopTimer = null;
    }

    // 获取最新的值列表以确保索引正确
    let values: number[];
    if (column === 'year') {
      values = buildYearList();
    } else if (column === 'month') {
      values = buildMonthList(selectedYear);
    } else {
      values = buildDayList(selectedYear, selectedMonth);
    }

    // 确保索引在有效范围内
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

    // 强制重置自动滚动标志，确保点击时能立即滚动
    state.isAutoScrolling = false;

    // 先更新选中值
    applySelectionFromIndex(column, clampedIndex);

    // 立即滚动到中心位置（带动画）
    requestAnimationFrame(() => {
      scrollToIndex(column, clampedIndex, true);
    });
  }, [selectedYear, selectedMonth]);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm?.(date);
    handleDismiss();
  };

  const handleCancel = () => {
    onCancel?.();
    handleDismiss();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      [yearColumnState, monthColumnState, dayColumnState].forEach(state => {
        if (state.current.scrollStopTimer) {
          clearTimeout(state.current.scrollStopTimer);
        }
      });
    };
  }, []);

  // 构建列组件
  const buildColumn = (
    column: 'year' | 'month' | 'day',
    values: number[],
    labelBuilder: (value: number) => string
  ) => {
    const state = column === 'year' ? yearColumnState.current :
                  column === 'month' ? monthColumnState.current :
                  dayColumnState.current;
    const ref = column === 'year' ? yearColumnRef :
                 column === 'month' ? monthColumnRef :
                 dayColumnRef;

    // 使用 state 中的 centerIndex，而不是 ref 中的，确保能触发重新渲染
    const centerIndex = column === 'year' ? yearCenterIndex :
                        column === 'month' ? monthCenterIndex :
                        dayCenterIndex;

    return (
      <View style={styles.columnContainer}>
        <ScrollView
          ref={ref}
          onScroll={(e) => handleScroll(column, e)}
          onMomentumScrollEnd={(e) => {
            // 滚动结束时，确保对齐到最近的项
            if (!state.isAutoScrolling) {
              const offsetY = e.nativeEvent.contentOffset.y;
              const centerOffset = offsetY + (ITEM_HEIGHT * (VISIBLE_ITEM_COUNT - 1) / 2) - PADDING;
              const newIndex = Math.round(centerOffset / ITEM_HEIGHT);
              const clampedIndex = Math.max(0, Math.min(newIndex, values.length - 1));

              // 如果当前索引与中心索引不一致，需要对齐
              if (Math.abs(state.centerIndex - clampedIndex) > 0) {
                state.centerIndex = clampedIndex;

                // 更新 state 中的 centerIndex，触发重新渲染
                if (column === 'year') {
                  setYearCenterIndex(clampedIndex);
                } else if (column === 'month') {
                  setMonthCenterIndex(clampedIndex);
                } else {
                  setDayCenterIndex(clampedIndex);
                }

                applySelectionFromIndex(column, clampedIndex);
                // 延迟对齐，避免立即触发
                setTimeout(() => {
                  if (!state.isAutoScrolling) {
                    scrollToIndex(column, clampedIndex, true);
                  }
                }, 50);
              }
            }
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: PADDING,
            paddingBottom: PADDING,
          }}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEnabled={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {values.map((value, index) => {
            const distance = Math.abs(index - centerIndex);
            let opacity = 1;
            let fontSize = 18;
            let fontWeight: '400' | '500' | '600' = '500';

            if (distance === 0) {
              opacity = 1;
              fontSize = 18;
              fontWeight = '500';
            } else if (distance === 1) {
              opacity = 0.39;
              fontSize = 17;
              fontWeight = '500';
            } else if (distance === 2) {
              opacity = 0.1;
              fontSize = 15;
              fontWeight = '500';
            } else {
              opacity = 0.1;
              fontSize = 15;
              fontWeight = '500';
            }

            return (
              <TouchableOpacity
                key={`${column}-${value}-${index}`}
                style={[styles.pickerItem, { height: ITEM_HEIGHT }]}
                onPress={() => {
                  handleItemPress(column, index);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                delayPressIn={0}
                delayPressOut={0}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      opacity,
                      fontSize,
                      fontWeight,
                    },
                  ]}
                >
                  {labelBuilder(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.container}
        >
          {/* 顶部工具栏 */}
          <View style={styles.toolbar}>
            <TouchableOpacity onPress={handleCancel} style={styles.toolbarButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.toolbarButton}>
              <Text style={styles.confirmText}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* 日期选择器 */}
          <View style={styles.pickerWrapper}>
            {/* 中间选中指示器 - 渐变背景 */}
            <View style={[styles.selectedIndicatorContainer, { top: 40 + ITEM_HEIGHT * 2 }]}>
              <LinearGradient
                colors={['#F4F1FB', '#E8E2F4']}
                start={{ x: -0.966, y: -0.259 }}
                end={{ x: 0.966, y: 0.259 }}
                locations={[0.26, 0.83]}
                style={styles.selectedIndicator}
              />
            </View>

            {/* 三个滚动列 */}
            <View style={styles.pickerRow}>
              {buildColumn('year', years, (value) => `${value}年`)}
              {buildColumn('month', months, (value) => `${String(value).padStart(2, '0')}月`)}
              {buildColumn('day', days, (value) => `${String(value).padStart(2, '0')}日`)}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 385,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EDEDED',
  },
  toolbarButton: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 15,
    color: '#828897',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8066D0',
  },
  pickerWrapper: {
    height: CONTAINER_HEIGHT,
    position: 'relative',
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 8,
  },
  selectedIndicatorContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
  },
  selectedIndicator: {
    flex: 1,
    borderRadius: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    height: CONTAINER_HEIGHT,
  },
  columnContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    color: '#31343B',
  },
});
