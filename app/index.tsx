import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { style } from './style';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

const DatePage = ({ date, isToday }: { date: Date; isToday: boolean }) => {
  const [inputFocused, setInputFocused] = useState(false);
  const inputAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(inputAnimation, {
      toValue: inputFocused ? 1 : 0,
      useNativeDriver: true,
      damping: 12,
      mass: 1,
      stiffness: 120,
    }).start();
  }, [inputFocused]);

  const animatedInputStyle = {
    transform: [
      {
        scale: inputAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
    shadowOpacity: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.25],
    }),
    shadowRadius: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 16],
    }),
    borderColor: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#ccc', '#4A90E2'],
    }),

  };

  const onFocus = () => {
    setInputFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onBlur = () => {
    setInputFocused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getWeekNumber = (d: Date) => {
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.datePageContainer}>
        <View style={style.contentContainer}>
          <View style={style.dateSection}>
            <Text style={style.dateText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <View style={style.bord}>
            <LinearGradient
        colors={[
          '#0c0c0c50',
          '#D9BA72',
          '#f7eee350',
          '#0c0c0c',
          '#0c0c0c',
          '#0c0c0c',
        ]}
        style={style.in}
      >
            <Animated.View style={[style.inputContainer, animatedInputStyle]}>
              <TextInput
                style={[style.textInput, { borderColor: inputFocused ? '#4A90E2' : '#ccc' }]}
                multiline
                placeholder="Write your thoughts for today..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                onFocus={onFocus}
                onBlur={onBlur}
                selectionColor="#4A90E2"
                accessibilityLabel="Daily journal entry"
                accessibilityHint="Write your thoughts, ideas, or experiences for today"
                accessibilityRole="text"
                importantForAccessibility="yes"
                autoCorrect={true}
                spellCheck={true}
                clearButtonMode="while-editing"
              />
            </Animated.View>
            </LinearGradient>
            </View>
            <Text style={style.weekNumberText}>
              Week {getWeekNumber(date)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = () => {
  const today = new Date();
  const router = useRouter();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const weekScrollViewRef = useRef<ScrollView | null>(null);
  const dateScrollViewRef = useRef<ScrollView | null>(null);
  const [monthWeeks, setMonthWeeks] = useState<Date[][]>([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [fontsLoaded] = useFonts({
    InstrumentSerif: require('assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  useEffect(() => {
    generateMonthWeeks(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (monthWeeks.length > 0 && !initialScrollDone) {
      const todayDate = new Date();

      const weekIndex = monthWeeks.findIndex((week) =>
        week.some(
          (date) =>
            date.getDate() === todayDate.getDate() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getFullYear() === todayDate.getFullYear()
        )
      );

      const dateIndex =
        weekIndex !== -1
          ? monthWeeks[weekIndex].findIndex(
            (date) =>
              date.getDate() === todayDate.getDate() &&
              date.getMonth() === todayDate.getMonth() &&
              date.getFullYear() === todayDate.getFullYear()
          )
          : 0;

      if (weekIndex !== -1) {
        weekScrollViewRef.current?.scrollTo({
          y: weekIndex * Dimensions.get('window').height,
          animated: true,
        });
        setCurrentWeekIndex(weekIndex);

        if (dateIndex !== -1) {
          setTimeout(() => {
            dateScrollViewRef.current?.scrollTo({
              x: dateIndex * width,
              animated: true,
            });
            setCurrentDateIndex(dateIndex);
          }, 100);
        }
      }
      setInitialScrollDone(true);
    }
  }, [monthWeeks, initialScrollDone]);

  const generateMonthWeeks = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    for (let i = firstDayOfMonth.getDay() - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      currentWeek.push(date);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      const daysToAdd = 7 - currentWeek.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const date = new Date(year, month + 1, i);
        currentWeek.push(date);
      }
      weeks.push(currentWeek);
    }

    setMonthWeeks(weeks);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDateScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentDateIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentDateIndex(index);
    }
  };

  const handleWeekScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / Dimensions.get('window').height);

    if (newIndex !== currentWeekIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentWeekIndex(newIndex);
    }
  };

  const pinchGesture = Gesture.Pinch().onEnd(() => {
    router.push('/week');
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
      <LinearGradient
        colors={[
          '#B6C874',
          '#D9BA72',
          '#6FD9E5',
          '#0c0c0c',
          '#0c0c0c',
          '#0c0c0c',
        ]}
        style={style.container}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <ScrollView
            ref={weekScrollViewRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleWeekScroll}
            snapToInterval={Dimensions.get('window').height}
            decelerationRate="fast"
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
            {monthWeeks.map((week, weekIndex) => (
              <View
                key={weekIndex}
                style={{
                  width: '100%',

                }}
              >
                <ScrollView
                  ref={dateScrollViewRef}
                  horizontal
                  pagingEnabled
                  nestedScrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleDateScroll}
                  snapToInterval={width}
                  decelerationRate="fast"
                  contentContainerStyle={{
                    flexGrow: 1,
                  }}
                >
                  {week.map((date, dateIndex) => (
                    <View
                      key={dateIndex}
                      style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height,
                      }}
                    >
                      <DatePage
                        date={date}
                        isToday={
                          date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear()
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </GestureHandlerRootView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
