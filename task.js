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
    this.parentText = null;
    this.rightToggle = false;
    this.timestamp = null;
    this.x = null;
    this.x0 = null;
    this.sx = null;
    this.dtime = null;
    this.dtime0 = null;    
    this.elapsed0 = null;
    this.timerelapsed0 = null;
    this.timervalue = null;
    this.timerdate = null;
    this.aimd = true;
  }

  canExpand = () => {
    return (this.subtasks.length > 0 || this.timestamp || this.since);
  }
  
  adjustExpansion = () => {
    if (!this.canExpand()) {
      this.expand = false;
    }
    return this.expand;
  }

  expansion = (exp) => {
    if (!this.canExpand()) {
      this.expand = false;
    } else {
      this.expand = (exp ? exp : !this.expand);
    }
    return this.expand;
  }

  setName = (name) => {
    this.name = name
  }

  addTask = (task, index) => {
    const ind = (index !== undefined ? index : this.subtasks.length);
    this.subtasks.splice(ind, 0, task);
    task.parent = this;
    task.setParentText(null);
    this.updateParentText(null);
  }

  moveTask = (task, index) => {
    let oldIndex = this.subtasks.indexOf(task) ;
    oldIndex = (oldIndex < index ? oldIndex : oldIndex + 1);
    if (this.subtasks.indexOf(task) > -1) {
      this.subtasks.splice(index, 0, task);
      this.subtasks.splice(oldIndex, 1);
    }
    this.updateParentText(null);
  }

  deleteTask = (task) => {
    const index = this.subtasks.indexOf(task);
    if (index > -1) {
      this.subtasks.splice(index, 1);
      task.parent = null;
      task.parentText = null;
    }
    this.updateParentText(null);
  }

  setKirametal = (string) => {
    this.x = toMillis(string.split('/')[0]);
    this.sx = toMillis(string.split('/')[1]);
    if (!this.since) {
      this.setSince();
    }
  }
  
  setSince = () => {
    this.since = Date.now();
    this.dtime = 0;
  }

  doDtime = (adtimeString) => {
//    console.log('adtime: ', adtimeString);
    const ad = toMillis(adtimeString);
    console.log('ad: ', ad);
    this.dtime = this.dtime + ad;
    this.increase(ad);
//    console.log('dtime: ', this.dtime);
  }

  setElapsed = () => {
    if (this.elapsed0) {
      this.dtime0 = null;
      this.elapsed0 = null;
      this.x0 = null;
    } else {
      this.dtime0 = this.dtime;
      this.elapsed0 = Date.now();
      this.x0 = this.x;
    }
  }
  
  /*
  sender = book
  receiver = reading
  
  cwnd = x
  receive packets / send acks = do dtime
  losing of packet = left behind / negative dtime
  
  do dtime -> increase cwnd
  negative dtime -> decrease cwnd

  */
  getDtime = () => {
    const elapsed = (this.elapsed0 ? Date.now() - this.elapsed0 : 0);
    return (this.dtime + elapsed);
  }
  
  deleteKirametal = () => {
    this.since = null;
  }
  
  //[0, 4] <-> [0, 16]
  //0->4
  //16->0
  //f(x)=4-x/4
  increase = (elapsed) => {
    const nx = this.x0 + (4-this.x/(4*3600000))*elapsed;
    if (nx < 0.9*this.sx) {
      this.x = nx;
    }
  }
  
  addElapsed = () => {
    const elapsed = Date.now() - this.elapsed0;
    this.dtime = this.dtime0 + elapsed;
    if (this.aimd) {
      this.increase(elapsed);
    }
  }
  
  decrease = () => {
    this.x = this.x * 10/11;
  }

  setX = () => {
    if (this.elapsed0) {
      this.addElapsed();
      this.dtime0 = this.dtime;
      this.elapsed0 = Date.now();
      this.x0 = x;
    }
  }
  
  onCompleteK = (x) => {
//    if (fq < -300000) {
    console.log('x: ', this.x);
    if (this.elapsed0) {
      this.addElapsed();
    }
    if (this.aimd && x < -600000) {
      this.setX();
      this.decrease();
    }
  }
  
  setAimd = () => {
    this.aimd = !this.aimd;
  }
  
  kirametal = () => {
    return (
      <Kirametal
        since={() => this.since}
        x={() => this.x}
        sx={() => this.sx}
        dtime={() => this.dtime}
        onPress={() => this.setElapsed()}
        onComplete={(x) => this.onCompleteK(x)}
        color={() => this.elapsed0}
        aimd={() => this.aimd}
      />
    );
  }  

  pauseTimer = () => {
    if (this.timerelapsed0) {
      const timerelapsed = Date.now() - this.timerelapsed0;
      this.timerelapsed0 = null;
      this.timestamp = this.timestamp + timerelapsed;
      this.timerdate = this.td(this.timestamp);
    } else {
      this.timerelapsed0 = Date.now();
    }
  }
  
  td = (timestamp) => {
    const timerdate = new Date(timestamp);
    return (timerdate.getHours() + ':' + timerdate.getMinutes() + ':' + timerdate.getSeconds());
  }
  
  setTimer = (value) => {
    this.timervalue = toMillis(value);
    this.timestamp = parseTime(value);
    this.timerdate = this.td(this.timestamp);
  }

  deleteTimer = () => {
    this.timestamp = null;
  }

  getTimestamp = () => {
    const elapsed = (this.timerelapsed0 ? Date.now() - this.timerelapsed0 : 0);
    return (this.timestamp + elapsed);
  }
  
  timer = () => {
    return (
      <Timer
        key={Date.now()}
        onPress={() => this.pauseTimer()}
        getTimestamp={() => this.getTimestamp()}
        value={this.timervalue}
        getDate={() => this.timerdate}
        color={() => !this.timerelapsed0}
      />
    );
  }

  setParentText = (parentText) => {
    if (parentText) {
      this.parentText = parentText;
    } else {
      //console.log('rightToggle: ', this.parent.rightToggle);
      this.parentText = (!this.parent.rightToggle ? this.parent.subtasks.indexOf(this) + 1 : null);
    }
  }

  rightText = () => {
    return (
      <Text style={styles.taskText}>{'«(' + this.subtasks.length + ')»'}</Text>
    );
  }

  onPressRight = () => {
    this.rightToggle = !this.rightToggle;
    this.subtasks.forEach((task, index) => task.setParentText(!this.rightToggle ? index + 1 : null));
  }
  
  updateParentText = (text) => {
    this.subtasks.forEach((task, index) => task.setParentText(text ? text : (!this.rightToggle ? index + 1 : null)));
  }
  
  sep = (x, s) => {
    return (x ? s : null);
  }
  
  display = (callback, canExpand, expand) => {
    const exp = (canExpand ? (expand ?  '(↓)' : '(→)') : '');
    const parentText = (this.parentText ? this.parentText + '»' : null);
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
        <Text style={styles.taskText}>{exp} {parentText} {' '}</Text>
        <TouchableOpacity
          onPress={callback}
        >
          <Text style={styles.taskText}>
            {this.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Task;
