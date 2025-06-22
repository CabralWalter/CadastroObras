import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { ObrasProvider } from './src/contexts/ObrasContext';

import HomeScreen from './src/screens/HomeScreen';
import CadastroObraScreen from './src/screens/CadastroObraScreen';
import DetalhesObraScreen from './src/screens/DetalhesObraScreen';
import CadastroFiscalizacaoScreen from './src/screens/CadastroFiscalizacaoScreen';
import DetalhesFiscalizacaoScreen from './src/screens/DetalhesFiscalizacaoScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ObrasProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Obras em Andamento',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
            }}
          />

          <Stack.Screen
            name="CadastroObra"
            component={CadastroObraScreen}
            options={({ route }) => ({
              title: route.params?.obra ? 'Editar Obra' : 'Nova Obra',
            })}
          />

          <Stack.Screen
            name="DetalhesObra"
            component={DetalhesObraScreen}
            options={{
              title: 'Detalhes da Obra',
            }}
          />

          <Stack.Screen
            name="CadastroFiscalizacao"
            component={CadastroFiscalizacaoScreen}
            options={{
              title: 'Nova Fiscalização',
            }}
          />

          <Stack.Screen
            name="DetalhesFiscalizacaoScreen"
            component={DetalhesFiscalizacaoScreen}
            options={{ title: 'Detalhes da Fiscalização' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </ObrasProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
