import { Text } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { formathms } from './utils'
import React, {useState, useEffect} from 'react';

function Timer(props) {
  const [rem, setRem] = useState(0);
  const key = Date.now();

  useEffect(() => {
    const timer = setTimeout(() => {
      setRem(() => remTime(props.timestamp));
    }, 900);
    return () => {
      clearTimeout(timer);
    };
  }, [rem]);

  const remTime = (timestamp) => {
    const remMillis = timestamp - Date.now();
    const seconds = (remMillis / 1000);
    return seconds;
  };

  const onPress = () => {
    return;
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <CountdownCircleTimer
        isPlaying
        key={key}
        duration={0}
        colors='#ffffff'
      >
        {({ remainingTime, color }) =>
          <Text style={{ color, fontSize: 20 }}>
            {formathms(rem)}
          </Text>
        }
      </CountdownCircleTimer>
    </TouchableOpacity>
  );
}

export default Timer;
