import React from 'react';
import {AppRegistry} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Main);

function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}
