import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const today = new Date();

  const weekDates = [];
  let current = new Date();
  const dayOfWeek = current.getDay();
  current.setDate(current.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const date = new Date(current);
    weekDates.push(date);
    current.setDate(current.getDate() + 1);
  }

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentDateIndex(index);
  };

  const scrollToDate = (index: React.SetStateAction<number>) => {
    setCurrentDateIndex(index);
    scrollViewRef.current?.scrollTo({
      x: Number(index) * width,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f7eee3', '#B6C874', '#D9BA72', '#C73A3C', '#6FD9E5']}
        style={styles.background}
      />

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
          setCurrentDateIndex(index);
        }}
      >
        {weekDates.map((date, index) => {
          return (
            <View key={index} style={[styles.dateContainer, { width: width }]}>
              <Text style={styles.dateText}>
                {date.getDate()} {date.toLocaleString('default', { month: 'long' })},{' '}
                {date.getFullYear()}
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
          );
        })}
      </ScrollView>

      <View style={styles.datebox}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToDate(index)}
          >
            <Text
              style={[
                styles.promptText,
                index === currentDateIndex ? styles.highlightedDate : null,
              ]}
            >
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    backgroundColor: '#181818',
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
    backgroundColor: '#f7eee320',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    margin: 2,
    width: '90%',
    borderRadius: 10,
  },
  highlightedDate: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 22,
  },
});

export default HomeScreen;
