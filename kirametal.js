import React, {useState, useEffect} from 'react';
import { Text, View } from 'react-native';
import { TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { toMillis, formathms } from './utils';
import { styles } from './styles';
import Clock from './clock';

function Kirametal(props) {
  const [fq, setFq] = useState(0);
  const [cnv, setCnv] = useState(0);
  
  const forequal = (dtime) => {
    const whenequal = (dtime * props.sx() / props.x()) + props.since();
    let forequall = whenequal - Date.now();
//    forequall = forequall / 1000;
    return forequall;
  };
  
  const t = (dtime, z = 0) => {
//    const num = (z*props.x - props.sx*dtime - props.since*props.x + Date.now()*props.x)
    const num = (props.x()*(z - props.since() + Date.now()) - props.sx()*dtime);
    const den = (props.sx() - props.x());
    return (num / den);
  };

  const conv = (dtime) => {
    const f = forequal(dtime);
    return (f < 0 ? -t(dtime, 0) : f);
  };

  const onComplete = () => {
    setFq(forequal(props.dtime()));
    setCnv(conv(props.dtime()));
    props.onComplete(-t(props.dtime(), 0));
  }
  
  const exp = () => {
    return (t(props.dtime(), forequal(props.dtime()) + 1000) / 1000).toFixed(2);
  }

  return (
    <Clock
      input={formathms(cnv / 1000)}
      color={props.color() ? '#FF0051' : '#ffffff'}
      onPress={props.onPress}
//      onComplete={() => setFq(forequal(props.dtime()))}
      onComplete={onComplete}
      top={(props.aimd() ? 'AX: ' : 'X: ') + exp()}
      bottom={formathms(fq / 1000)}
    />
  );
}

export default Kirametal;
