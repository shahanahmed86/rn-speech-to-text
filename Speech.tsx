/* eslint-disable react-native/no-inline-styles */
import Voice from '@react-native-voice/voice';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

type ActionType = 'up' | 'down' | 'left' | 'right';

type Action = {
  [key in ActionType]: string;
};

const ACTIONS: Action = {up: 'up', down: 'down', left: 'left', right: 'right'};

function Speech() {
  const [event, setEvent] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<Error | null | undefined>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        setError(new Error('The service is not found...'));
        return;
      }

      const recognizer = await Voice.getSpeechRecognitionServices();
      console.log('recognizer...', recognizer);

      Voice.onSpeechStart = () => setIsRecording(true);
      Voice.onSpeechEnd = () => setIsRecording(false);
      Voice.onSpeechError = ({error: e}) => setError(e as Error);
      Voice.onSpeechResults = ({value}) => setResults(value!);
    })();
    return () => {
      //destroy the process after switching the screen
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    const prev = [...results];
    const ind = prev.findIndex(t => t.split(' ').some(k => k in ACTIONS));
    if (ind < 0) return;

    const key = prev[ind]
      .split(' ')
      .reverse()
      .find(k => k in ACTIONS) as ActionType;

    setEvent(`You've triggered "${ACTIONS[key]}" event`);
  }, [results, setResults]);

  const onStartRecording = async () => {
    try {
      setEvent('');
      setResults([]);
      setError(null);
      await Voice.start('en-US');
    } catch (e) {
      setError(e as Error);
    }
  };

  const onStopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{flex: 0.6, paddingTop: 24, alignSelf: 'center'}}>
        <Text style={{fontSize: 20, color: '#1877F2', fontWeight: '500'}}>
          Voice Input
        </Text>
      </View>
      <View style={{flex: 0.3}}>
        <Text
          style={{
            color: event ? '#198754' : '#037d50',
            fontSize: event ? 24 : 18,
          }}>
          {event || results}
        </Text>
        {error ? (
          <Text style={{color: '#EC0023', fontSize: 18}}>
            {(error.message || error).toString()}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={{flex: 0.2}}>
        <TouchableOpacity
          onPress={isRecording ? onStopRecording : onStartRecording}>
          <Button
            icon={isRecording ? 'microphone-off' : 'microphone'}
            textColor="#EC0023">
            {isRecording ? 'Stop' : 'Start'}
          </Button>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

export default Speech;
