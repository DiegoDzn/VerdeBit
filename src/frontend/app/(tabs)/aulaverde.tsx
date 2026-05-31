import { StyleSheet, Text, View } from 'react-native';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Recursos y Quizzes</Text>
      <Text style={styles.subTitleText}>¡Aprende sobre el humedal!</Text>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: '#ffffff',
    alignItems: 'center'},
  subTitleText: {
    paddingBottom: 625, 
    fontSize: 18,
    fontWeight: '300', 
    color: '#000000', 
    marginTop: 1,
  },
  text: { 
    fontSize: 30, 
    color: '#2e7d32',
    fontWeight: 'bold'}
});