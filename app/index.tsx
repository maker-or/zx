import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const today = new Date().toISOString().split('T')[0];
  const router = useRouter();
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [monthDates, setMonthDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const dateScrollViewRef = useRef<ScrollView | null>(null);

  const [fontsLoaded] = useFonts({
    'InstrumentSerif': require('assets/fonts/InstrumentSerif-Regular.ttf')
  })

  useEffect(() => {
    generateMonthDates(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const todayIndex = monthDates.findIndex(date => date === today);
    if (todayIndex !== -1) {
      scrollToDate(todayIndex);
    }
  }, [monthDates]);

  const generateMonthDates = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    setMonthDates(dates.map(date => date.toISOString()));
    setCurrentDateIndex(0);
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    }, 0);
  };

  const triggerHaptic = () => {
    //Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentDateIndex) {
      triggerHaptic(); // Trigger haptic feedback when the index changes
      setCurrentDateIndex(index);
    }
  };

  const scrollToDate = (index: React.SetStateAction<number>) => {
    setCurrentDateIndex(index);
    const offset = 20; // Adjust this value as needed for better visibility
    scrollViewRef.current?.scrollTo({
      x: (Number(index) * width) - offset,
      animated: true,
    });
    dateScrollViewRef.current?.scrollTo({
      x: Number(index) * width,
      animated: true,
    });
  };

  const pinchGesture = Gesture.Pinch()
    .onEnd(() => {
      router.push('/week');
    });

  useEffect(() => {
    const todayIndex = monthDates.findIndex(date => date === today);
    if (todayIndex !== -1) {
      scrollToDate(todayIndex);
    }
  }, [monthDates]);

  const inputContainer = (date: string) => {
    if (date === today) {
      return (
        <TextInput
          style={styles.textInput}
          multiline={true}
          placeholder='Whats on your mind,today ?'
          placeholderTextColor='#f7eee350'
        />
      );
    } else {
      return (
        <Text style={styles.message}>Unless you have a time machine, you cannot edit it</Text>
      );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#f7eee3', '#B6C874', '#D9BA72', '#C73A3C', '#6FD9E5']}
            style={styles.background}
          />
          <StatusBar style="light" />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={8}
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
            decelerationRate='fast'
            snapToInterval={width}
            snapToAlignment='center'
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              if (index !== currentDateIndex) {
                triggerHaptic();
                setCurrentDateIndex(index);
              }
            }}
          >
            {monthDates.map((date, index) => (
              <View key={index} style={[styles.dateContainer, { width: width }]}>
                <Text style={styles.dateText}>
                  {new Date(date).getDate()} {new Date(date).toLocaleString('default', { month: 'long' })},{' '}
                  {new Date(date).getFullYear()}
                </Text>

                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={[
                      '#B6C874',
                      '#f7eee3',
                      '#D9BA72',
                      '#C73A3C',
                      '#6FD9E5',
                    ]}
                    style={styles.background}
                  />
                  {inputContainer(date)}
                </View>
              </View>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            ref={dateScrollViewRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datebox}
            snapToInterval={width}
            snapToAlignment="center"
            decelerationRate="fast"
          >
            {monthDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToDate(index)}
                style={[
                  styles.dateButton,
                  index === currentDateIndex ? styles.selectedDate : null,
                ]}
              >
                <Text
                  style={[
                    styles.promptText,
                    index === currentDateIndex ? styles.highlightedDate : null,
                  ]}
                >
                  {new Date(date).getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Link href="/week" style={{ padding: 10, backgroundColor: '#007bff', color: 'white', borderRadius: 5, textAlign: 'center' }}>
            Week
          </Link>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0c0c',
    fontFamily: 'InstrumentSerif'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
    filter: 'blur(70px)',
  },
  scrollViewContent: {
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'serif',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  dateText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: 'InstrumentSerif',
  },

  inputContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#0c0c0c',
    borderRadius: 24,
    padding: 4,
    color: '#FFF',
  },
  bodergrad: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
    width: '100%',
    height: '100%',
    backgroundColor: '#0c0c0c',
    color: '#FFF',
  },
  promptText: {
    color: '#777',
    fontSize: 20,
    fontFamily: 'InstrumentSerif',
  },
  textInput: {
    color: '#E0E0E0',
    fontSize: 42,
    height: '100%',
    width: '100%',
    borderRadius: 24,
    textAlignVertical: 'top',
    backgroundColor: '#0c0c0c',
    fontFamily: 'InstrumentSerif',
    padding:10
  },
  message: {
    color: '#f7eee350',
    fontSize: 36,
    height: '100%',
    width: '100%',
    borderRadius: 24,
    textAlignVertical: 'top',
    backgroundColor: '#0c0c0c',
    fontFamily: 'InstrumentSerif',
    padding:10
  },
  datebox: {
    backgroundColor: '#0c0c0c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    margin: 2,
    width: '90%',
    borderRadius: 10,
    fontFamily: 'InstrumentSerif',
  },
  highlightedDate: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: 'InstrumentSerif',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    padding: 10,
    fontFamily: 'InstrumentSerif',
  },
  navigationButton: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'InstrumentSerif',
  },
  monthYearText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'InstrumentSerif',
  },
  dateButton: {
    padding: 10,
    borderRadius: 10, 
    fontFamily: 'InstrumentSerif',
  },
  selectedDate: {

    transform: [{ scale: 1.1 }],
    fontFamily: 'InstrumentSerif', 
  },
});

export default HomeScreen;
