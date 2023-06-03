import React, {useState, useEffect} from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { formathms } from './utils'
import { styles } from './styles';

function Clock(props) {  
  const onPress = () => {
    props.onPress();
  };
  renderTime = ({ remainingTime, color }) => {
    return (
      <View style={styles.clock}>
        {props.top
        ? <Text style={{ color, fontSize: 15, fontWeight: 'bold', }}>
            {props.top}
          </Text> : null}
        <Text style={{ color, fontSize: 20, fontWeight: 'bold', }}>
          {props.input}
        </Text>
        {props.bottom ?
          <Text style={{ color, fontSize: 15, fontWeight: 'bold', }}>
            {props.bottom}
          </Text> : null}
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <CountdownCircleTimer
        isPlaying
        duration={1}
        colors={props.color ? props.color : '#ffffff'}
        onComplete={() => {props.onComplete(); return { shouldRepeat: true, delay: 0 };}}
      >
        {renderTime}
      </CountdownCircleTimer>
    </TouchableOpacity>
  );
}

export default Clock;
