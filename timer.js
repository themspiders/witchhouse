import React, {useState, useEffect} from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { formathms } from './utils'
import Clock from './clock';
import { styles } from './styles';

function Timer(props) {
  const [rem, setRem] = useState(0);
  const key = Date.now();

  const remTime = (timestamp) => {
    const remMillis = timestamp - Date.now();
    const seconds = (remMillis / 1000);
    return seconds;
  };

  return (
    <Clock
      input={formathms(rem)}
      color={rem > 0 && props.color() ? '#00ff00' : '#ffffff'}
      //gren #00ff00
      onPress={rem > 0 ? props.onPress : () => {}}
      onComplete={() => setRem(remTime(props.getTimestamp()))}
      top={formathms(props.value / 1000)}
      bottom={props.getDate()}
    />
  );

}

export default Timer;
