import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateCardScreen from './src/screens/CreateCardScreen';
import ViewCardScreen from './src/screens/ViewCardScreen';
import EditCardScreen from './src/screens/EditCardScreen';
import MyCardsScreen from './src/screens/MyCardsScreen';
import NearbyShareScreen from './src/screens/NearbyShareScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateCard" component={CreateCardScreen} />
          <Stack.Screen name="ViewCard" component={ViewCardScreen} />
          <Stack.Screen name="EditCard" component={EditCardScreen} />
          <Stack.Screen name="MyCards" component={MyCardsScreen} />
          <Stack.Screen name="NearbyShare" component={NearbyShareScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
