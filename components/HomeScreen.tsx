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

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [monthDates, setMonthDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const dateScrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    generateMonthDates(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
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

  // const goToPreviousMonth = () => {
  //   if (currentMonth === 0) {
  //     setCurrentMonth(11);
  //     setCurrentYear(currentYear - 1);
  //   } else {
  //     setCurrentMonth(currentMonth - 1);
  //   }
  // };

  // const goToNextMonth = () => {
  //   if (currentMonth === 11) {
  //     setCurrentMonth(0);
  //     setCurrentYear(currentYear + 1);
  //   } else {
  //     setCurrentMonth(currentMonth + 1);
  //   }
  // };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f7eee3', '#B6C874', '#D9BA72', '#C73A3C', '#6FD9E5']}
        style={styles.background}
      />

      {/* <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.navigationButton}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {new Date(currentYear, currentMonth, 1).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.navigationButton}>Next</Text>
        </TouchableOpacity>
      </View> */}

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          if (index !== currentDateIndex) {
            triggerHaptic(); // Also trigger on momentum scroll end
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
              <View style={styles.bodergrad}>
                <TextInput style={styles.textInput} multiline={true} />
              </View>
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
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c0c0c',
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
    fontFamily: 'serif',
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
    fontFamily: 'serif',
  },
  textInput: {
    color: '#E0E0E0',
    fontSize: 18,
    height: 100,
    textAlignVertical: 'top',
  },
  datebox: {
    backgroundColor: '#0c0c0c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    margin: 2,
    width: '90%',
    borderRadius: 10,
     // Allow dates to wrap to the next line
  },
  highlightedDate: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 22,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    padding: 10,
  },
  navigationButton: {
    color: '#FFF',
    fontSize: 16,
  },
  monthYearText: {
    color: '#FFF',
    fontSize: 20,
  },
  dateButton: {
    padding: 10, // Add padding for better touch area
    borderRadius: 10, // Rounded corners
  },
  selectedDate: {
    // Highlight color for selected date
    transform: [{ scale: 1.1 }], // Slightly increase size for effect
  },
});

export default HomeScreen;
