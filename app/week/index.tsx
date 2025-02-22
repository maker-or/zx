import { LinearGradient } from 'expo-linear-gradient';
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
export default function WeekScreen() {
  return (
    <View>
      <LinearGradient
        colors={['#f7eee3', '#B6C874', '#D9BA72', '#C73A3C', '#6FD9E5']}
        style={styles.background}
      />
      <Text>Welcome to the Week Screen!</Text>
    </View>
  );
}


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
})