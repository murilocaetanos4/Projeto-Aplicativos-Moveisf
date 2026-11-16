import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetalhesScreen from './src/screens/DetalhesScreen';
import DiarioScreen from './src/screens/DiarioScreen';
import QueroJogarScreen from './src/screens/QueroJogarScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import FormAvaliacaoScreen from './src/screens/FormAvaliacaoScreen'; // 1. IMPORTAR AQUI

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00e054',
        tabBarInactiveTintColor: '#678',
        tabBarStyle: {
          backgroundColor: '#1e232a',
          borderTopColor: '#2c3440',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎮</Text>,
        }}
      />
      <Tab.Screen
        name="Diario"
        component={DiarioScreen}
        options={{
          tabBarLabel: 'Diário',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📖</Text>,
        }}
      />
      <Tab.Screen
        name="QueroJogar"
        component={QueroJogarScreen}
        options={{
          tabBarLabel: 'Quero Jogar',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📌</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#14181c' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detalhes" component={DetalhesScreen} />
        <Stack.Screen name="Diario" component={DiarioScreen} />
        <Stack.Screen name="QueroJogar" component={QueroJogarScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        {/* 2. REGISTAR A ROTA AQUI */}
        <Stack.Screen name="FormAvaliacao" component={FormAvaliacaoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}