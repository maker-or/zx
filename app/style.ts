import {
  StyleSheet,
  Dimensions,
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
  },
  datePageContainer: {
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
    padding: 24,
  
  },
  dateSection: {
    width: '100%',
    height: '90%',
    alignItems: 'center',
    padding: 2,
    borderRadius: 24,
    marginBottom: 20,
  },
  bord: {

    flex: 1,
    width: '100%',
    height: '100%', // added height: '100%'
    borderRadius: 24,
  

    shadowColor: '#000',
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
    fontSize: 40,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
    letterSpacing: -0.75,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flex: 1,
    width: '100%',
    height: '100%', // added height: '100%'
    backgroundColor: '#0c0c0c',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',

    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    width: '100%',
    borderRadius: 16,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    fontFamily: 'InstrumentSerif',
    padding: 16,
    lineHeight: 40,
    marginTop: 16,
    minHeight: 160,
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
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'InstrumentSerif',
    marginTop: 16,
    opacity: 0.8,
    textAlign: 'center',
    letterSpacing: 0.5,
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
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});