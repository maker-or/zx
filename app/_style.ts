import {
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';


export const style = StyleSheet.create({
  text: {
    fontFamily: 'InstrumentSerif',
  },
  container: {
    height: '100%',
    flex: 1,
    overflow: 'hidden',
    filter: 'blur(3rem)'
  },  datePageContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },

  //background for each week
  contentContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    padding: 12, // Reduced padding for more space
    paddingTop: 4, // Minimal top padding
  },
  dateSection: {
    width: '100%',
    height: '100%', // Take full height
    alignItems: 'center',
    padding: 2,
    borderRadius: 24,
    flex: 1, // Use flex to fill available space
  },
  bord: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 24,
    shadowColor: '#000',
    marginTop: 8, // Small margin after date text
    marginBottom: 40, // Space for week number at bottom
  },

in:{
  flex: 1,
  width: '100%',
  height: '100%', // added height: '100%'
  borderRadius: 24,
  padding: 4,
  filter: 'blur(3rem)'


},

  dateText: {
    color: '#FFFFFF',
    fontSize: 24, // Reduced from 32
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
    letterSpacing: -0.75,
    textAlign: 'center',
    marginBottom: 8, // Reduced margin
  },
  inputContainer: {
    flex: 1,
    width: '100%',
    height: '100%', // added height: '100%'
    backgroundColor: '#0c0c0c',
    borderRadius: 24,
    padding: 24,
    // shadowColor: '#fff',
    fontFamily: 'InstrumentSerif',
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
    // elevation: 5,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20, // Slightly larger text
    width: '100%',
    borderRadius: 16,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    fontFamily: 'InstrumentSerif',
    padding: 20, // More padding for better touch target
    lineHeight: 32, // Better line height for readability
    marginTop: 8,
    minHeight: 200, // Ensure minimum height
  },
  
  // Bottom section that contains buttons, character count, and week number
  bottomSection: {
    marginTop: 'auto', // Push to bottom
    paddingTop: 16,
  },
  weekIndicator: {
    position: 'absolute',
    bottom: 20,
    width: '92%',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'InstrumentSerif',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bodergrad: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
    width: '100%',
    height: '100%', // added height: '100%'
    backgroundColor: '#FFFFFF',
    color: '#212529',
  },
  promptText: {
    color: '#777',
    fontSize: 20,
    fontFamily: 'InstrumentSerif',
  },
  message: {
    color: '#212529',
    fontSize: 20,
    height: '100%', // added height: '100%'
    width: '100%',
    borderRadius: 16,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    fontFamily: 'InstrumentSerif',
    padding: 16,
    lineHeight: 28
  },
  weekContainer: {
    height: Dimensions.get('window').height,
    width: '100%',
    flex: 1,
    overflow: 'hidden',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  weekNumberText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'InstrumentSerif',
    textAlign: 'center',
    marginTop: 12,
    paddingBottom: 8,
  },
  weekCell: {
    backgroundColor: '#FFFFFF',
    
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
  },
  charCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontFamily: 'InstrumentSerif',
  },
  editButton: {
    backgroundColor: '#6b7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b7280',
    flex: 1,
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'InstrumentSerif',
  },
  lockedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  lockedText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'InstrumentSerif',
  },
  lockedSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'InstrumentSerif',
  },
  
  // Navigation Header Styles
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    height: 100, // Fixed height
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
    letterSpacing: -0.5,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    marginLeft: 12,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  reflectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#242424',
    borderRadius: 60,
    marginLeft: 8,
  },
  reflectionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  
  // Week Overview Styles
  weekOverviewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  weekTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
    textAlign: 'center',
    marginBottom: 8,
  },
  weekDaysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  dayItemWithMemory: {
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  dayNumber: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'InstrumentSerif',
  },
  dayNumberWithMemory: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  dayName: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontFamily: 'InstrumentSerif',
    marginTop: 1,
  },
  memoryIndicator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4A90E2',
    marginTop: 2,
  },
  
  // Navigation hint styles
  navigationHint: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'InstrumentSerif',
  },
  
  // Bottom navigation hint styles
  bottomNavigationHint: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  bottomHintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'InstrumentSerif',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsButtonText: {
    fontSize: 18,
  },

  // Floating Navigation Styles
  floatingNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingNavBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 12, 12, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingNavFallback: {
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 70,
  },
});