import Voice from '@react-native-voice/voice';
import {useEffect, useState} from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import {Text, Button} from 'react-native-paper';

/** @typedef {'up'|'down'|'left'|'right'} ActionType */

const ACTIONS = {up: 'up', down: 'down', left: 'left', right: 'right'};

function Speech() {
  const [event, setEvent] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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
      Voice.onSpeechError = ({error}) => setError(error);
      Voice.onSpeechResults = ({value}) => setResults(value);
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

    /**  @type {ActionType[]} */
    const keys = prev[ind].split(' ').reverse();

    /**  @type {ActionType} */
    const key = keys.find(k => k in ACTIONS);
    if (!key) return; // never

    setEvent(`You\'ve triggered "${ACTIONS[key]}" event`);
  }, [results, setResults]);

  const onStartRecording = async () => {
    try {
      setEvent('');
      setResults([]);
      setError(null);
      await Voice.start('en-US');
    } catch (error) {
      setError(error);
    }
  };

  const onStopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      setError(error);
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
        <Text style={{fontSize: 20, color: '#1877F2', fontWeight: 500}}>
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
            {error.message || error}
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
