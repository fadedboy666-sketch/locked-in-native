import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0b0c10', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20 }}>Locked In</Text>
      <Link href="/blocker" asChild>
        <TouchableOp
