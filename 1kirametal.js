import React, {useState, useEffect} from 'react';
import { Text } from 'react-native';
import { TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { toMillis, formathms } from './utils';
import { styles } from './styles';

function Kirametal(props) {
  const [fq, setFq] = useState(0);
  const key = Date.now();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFq(() => forequal(props.getDtime()));
    }, 9000);
    return () => {
      clearTimeout(timer);
    };
  }, [fq]);

  const forequal = (dtime) => {
    const whenequal = (dtime * props.sx / props.x) + props.since;
    let forequall = whenequal - Date.now();
    forequall = forequall / 1000;
    return forequall;
  };

  const onPress = () => {
    props.onPress();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <CountdownCircleTimer
        isPlaying={true}
        key={key}
        duration={5}
        //lightblue '#00ffff'
        colors={props.color() ? ['#FF0051', '#00ffff'] : ['#ffffff', '#00ffff']}
        onComplete={() => ({ shouldRepeat: true, delay: 2 })}
      >
        {({ remainingTime, color }) =>
          <Text style={{ color, fontSize: 20 }}>
            {remainingTime}
          </Text>
        }
      </CountdownCircleTimer>
    </TouchableOpacity>
  );

}

export default Kirametal;
