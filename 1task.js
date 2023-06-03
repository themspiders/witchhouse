import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { toMillis, formathms, parseTime } from './utils';
import Kirametal from './kirametal';
import Timer from './timer';
import { styles } from './styles';

class Task {
  constructor({ name = null, expand = false } = {}) {
    this.name = name;
    this.parent = null;
    this.subtasks = [];
    this.expand = expand;
    this.since = null;
    this.x = null;
    this.sx = null;
//    this.kirametal = null;
    this.dtime = null;
    this.timer = null;
    this.parentText = null;
    this.rightToggle = false;
  }

  setName = (name) => {
    this.name = name
  }

  addTask = (task) => {
    this.subtasks.push(task);
    task.parent = this;
  }

  deleteTask = (task) => {
    const index = this.subtasks.indexOf(task);
    if (index > -1) {
      this.subtasks.splice(index, 1);
    }
    task.parent = null;
  }

  setKirametal = (string) => {
    this.x = toMillis(string.split('/')[0]);
    this.sx = toMillis(string.split('/')[1]);
    this.since = Date.now();
    this.dtime = 0;
  }

  dtime = (adtimeString) => {
//    console.log('adtime: ', adtimeString);
    this.dtime = this.dtime + toMillis(adtimeString);
//    console.log('dtime: ', this.dtime);
    console.log('dtime ', this.dtime);
  }

  kirametal = () => {
    return (
      <Kirametal
        since={this.since}
        x={this.x}
        sx={this.sx}
        dtime={this.dtime}
      />
    );
  }
  
  setTimer = (value) => {
    const timestamp = parseTime(value);
    if (this.timer) {
      this.timer.setTimer(timestamp);
    } else {
      this.timer = new Timer({ timestamp: timestamp });
      console.log('timer: ', this.timer);
    }
  }

  timerDisplay = () => {
    return (
      this.timer.display(formathms)
    );
  }

  setParentText = (parentText) => {
    this.parentText = parentText;
  }

  rightText = () => {
    return (
      <Text style={styles.taskText}>{'«(' + this.subtasks.length + ')»'}</Text>
    );
  }

  onPressRight = () => {
    this.subtasks.forEach((task, index) => task.setParentText(!this.rightToggle ? index + 1 : null));
    this.rightToggle = !this.rightToggle;
  }
  
  sep = (x, s) => {
    return (x ? s : null);
  }
  
  display = () => {
    const expand = (this.subtasks.length > 0  ? (this.expand ?  '(↓)' : '(→)') : '');
    const parentText = (this.parentText ? this.parentText + '»' : null);
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.taskText}>{expand} {parentText} {this.name}</Text>
      </View>
    );
  }
}

export default Task;
