import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { style } from './style';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

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
  const [inputFocused, setInputFocused] = useState(false);
  const inputAnimation = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'InstrumentSerif': require('assets/fonts/InstrumentSerif-Regular.ttf')
  });

  useEffect(() => {
    generateMonthWeeks(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (monthWeeks.length > 0 && !initialScrollDone) {
      const todayDate = new Date();
      
      const weekIndex = monthWeeks.findIndex(week => 
        week.some(date => 
          date.getDate() === todayDate.getDate() &&
          date.getMonth() === todayDate.getMonth() &&
          date.getFullYear() === todayDate.getFullYear()
        )
      );

      const dateIndex = weekIndex !== -1 ? 
        monthWeeks[weekIndex].findIndex(date => 
          date.getDate() === todayDate.getDate() &&
          date.getMonth() === todayDate.getMonth() &&
          date.getFullYear() === todayDate.getFullYear()
        ) : 0;

      if (weekIndex !== -1) {
        weekScrollViewRef.current?.scrollTo({
          y: weekIndex * Dimensions.get('window').height,
          animated: true
        });
        setCurrentWeekIndex(weekIndex);

        if (dateIndex !== -1) {
          setTimeout(() => {
            dateScrollViewRef.current?.scrollTo({
              x: dateIndex * width,
              animated: true
            });
            setCurrentDateIndex(dateIndex);
          }, 100); 
        }
      }
      setInitialScrollDone(true);
    }
  }, [monthWeeks, initialScrollDone]);

  useEffect(() => {
    Animated.spring(inputAnimation, {
      toValue: inputFocused ? 1 : 0,
      useNativeDriver: true,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
    }).start();
  }, [inputFocused]);

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

  const handleDateScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
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

  const pinchGesture = Gesture.Pinch()
    .onEnd(() => {
      router.push('/week');
    });

  const inputContainerStyle = {
    ...style.inputContainer,
    transform: [
      {
        translateY: inputAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  };

  const inputContainer = (date: Date) => {
    const isToday = date.getDate().toString() === today.getDate().toString() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();

    return (
      <Animated.View style={inputContainerStyle}>
        <TextInput
          style={style.textInput}
          multiline
          placeholder={isToday ? 'Whats on your mind, today?' : ''}
          placeholderTextColor='#0c0c0c'
          onFocus={() => {
            setInputFocused(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onBlur={() => setInputFocused(false)}
        />
      </Animated.View>
    );
  };

  const renderWeek = (week: Date[], index: number) => {
    return (
      <View key={index} style={style.weekContainer}>
        <ScrollView
          ref={dateScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleDateScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ width: width * week.length }}
        >
          {week.map((date, dateIndex) => (
            <View key={dateIndex} style={{ width: width }}>
              <View style={style.dateContainer}>
                <View style={style.header}>
                  <Text style={style.dateText}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                {inputContainer(date)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pinchGesture}>
        <View style={style.container}>
          <StatusBar style="dark" />
          <ScrollView
            ref={weekScrollViewRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onScroll={handleWeekScroll}
            scrollEventThrottle={16}
          >
            {monthWeeks.map((week, index) => renderWeek(week, index))}
          </ScrollView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
 
export default HomeScreen;
