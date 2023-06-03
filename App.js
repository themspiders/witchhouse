import React from 'react';
import { Text, View, TextInput, Button, ScrollView, StatusBar } from 'react-native';
import { TouchableOpacity, TouchableHighlight, LayoutAnimation, Platform, UIManager } from 'react-native';
import Task from './task';
import { styles, roundButton } from './styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      root: new Task({ name: 'root', expand: true }),
      selTask: null,
      moves: {
        M: null,
        R: null,
        direction: 0,
        subtask: false,
      },
      pinned: null,
      expandCurrent: true,
      pinnedSelected: false,
    };
  }
  
  storeData = async () => {
    const replacer = (key, value) => {
      return (key === 'parent' ? undefined : value);
    }
    try {
      await AsyncStorage.clear()
    } catch(e) {
      console.log('error clearing data');
    }  
    const data = this.state.root;
    try {
      const jsonValue = JSON.stringify(data, replacer, 2)
//      console.log('storeData: jsonValue: ', jsonValue);
      await AsyncStorage.setItem('@storage_Key', jsonValue)
    } catch (e) {
      console.log('error saving data');
    }
  }
  
  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@storage_Key');
      const data = (jsonValue ? JSON.parse(jsonValue) : null);
      return data;
    } catch(e) {
      console.log('error reading data: ', e);
    }
  }
  
  async componentDidMount() {
    const addTask = (jtask, parent) => {
      const task = new Task({ name: jtask.name, expand: jtask.expand });
      task.since = jtask.since;
      task.rightToggle = jtask.rightToggle;
      task.timestamp = jtask.timestamp,
      task.x = jtask.x;
      task.sx = jtask.sx;
      task.dtime = jtask.dtime;
      task.timervalue = jtask.timervalue;
      task.timerdate = jtask.timerdate;
      parent.addTask(task);
      jtask.subtasks.forEach(x => addTask(x, task));
    }
    const data = await this.getData();
    if (data) {
      data.subtasks.forEach(jtask => addTask(jtask, this.state.root));
    }
    await this.setState({root: this.state.root});
    setTimeout(() => this.setState({root: this.state.root}, this.storeData), 4000);
  }
  
  input = (placeholder, onSubmit) => {
    return (
      <TextInput
        ref={input => {this.textInput = input}}
        style={styles.input}
        placeholderTextColor='gray'
        placeholder={placeholder}
        onSubmitEditing={(value) => {this.textInput.clear(); onSubmit(value)}}
      />
    );
  }

  button = (placeholder, onSubmit) => {
    return (
      <TextInput
        ref={input => {this.textInput = input}}
        style={styles.input}
        placeholderTextColor='gray'
        placeholder={placeholder}
        onSubmitEditing={(value) => {this.textInput.clear(); onSubmit(value)}}
        //editable={false}
      />
    );
  }

  addTask = (taskAdd) => {
    const parent = this.state.selTask ? this.state.selTask : this.state.root;
    parent.addTask(taskAdd);
    parent.expand = true;
    this.setState({root: this.state.root}, this.storeData);
  }

  addTaskForm = () => {
    const submit = (value) => {
      const task = new Task({ name: value });
      this.addTask(task);
    };
    return (
      <View>
        {this.input('Name', (value) => submit(value.nativeEvent.text))}
      </View>//
    );
  }

  onPress = (task) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    task.expansion();
    this.setState({root: this.state.root}, this.storeData);
  }
  
  onPressRound = (task, pinned) => {
    let ntask = null;
    let pinnedSelected = false;
    if (this.state.selTask === task) {
      if (this.state.pinnedSelected) {
        if (pinned) {
          ntask = null;
          pinnedSelected = false;
        } else {
          ntask = task;
          pinnedSelected = false;
        }
      } else {
        if (pinned) {
          ntask = task;
          pinnedSelected = true;
        } else {
          ntask = null;
          pinnedSelected = false;
        }
      }
    } else {//different task
      ntask = task;
      pinnedSelected = pinned;
    }
    this.setState({selTask: ntask, pinnedSelected: pinnedSelected}, this.storeData);
  }

  onPressRight = (task) => {
    task.onPressRight();
    this.setState({selTask: this.state.selTask}, this.storeData);
  }
  
  displaySubTasks = (task) => {
    return (
      <View style={styles.subtasks}>
        {task.subtasks.map((subtask, index) =>
          <View key={index}>{this.displayTask(subtask, task)}</View>
        )}
      </View>
    );
  }
  
  displayTask = (task, parent) => {
    if (!task) {return;}
    const br = (task.expand && task.subtasks.length > 0 ? '\n' : null);
    if (task === this.state.root) {
      return (this.displaySubTasks(task));
    }
    return (
      <TouchableOpacity
//        style={[styles.item, !this.state.root.expand && { height: 40 }]}
        style={[styles.item]}
        onPress={() => this.onPress(task)}
        activeOpacity={0.8}
      >
      <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity //left button
              style={
                this.state.selTask === task
                ? (!this.state.pinnedSelected ? styles.roundButtonSel : styles.roundButtonSel1)
                : styles.roundButton
              }
              onPress={() => this.onPressRound(task, false)}
            >
            </TouchableOpacity>
            <Text>
              {'  '}{task.display(
                () => this.onPressRound(task, false), task.canExpand(), task.expand
              )}
            </Text>
          </View>
          <View style={{ flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => this.onPressRight(task)} //right button
            >
              {task.rightText()}
            </TouchableOpacity>
          </View>
        </View>
        
        {task.adjustExpansion()
        ? <View style={task.timestamp && task.since
              ? { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, }
              : { flexDirection: 'row', justifyContent: 'center' , marginBottom: 10, }
              }
          >
            {task.timestamp ? task.timer() : null}
            {task.since ? task.kirametal() : null}
          </View>
        : null
        }
        {task.adjustExpansion() ? this.displaySubTasks(task) : null}
      </View>
      </TouchableOpacity>
    );
  }

  displayAllTasks = () => {
    return (
      <View>
        {this.displayTask(this.state.root)}
      </View>
    );
  }
  
  deleteTask = (task) => {
    task.parent.deleteTask(task);
    const selTask = (task === this.state.selTask ? null : this.state.selTask);
    const pinnedSelected = (task === this.state.pinned ? false : this.state.pinnedSelected);
    this.setState({root: this.state.root, selTask: selTask, pinnedSelected: pinnedSelected}, this.storeData);
  }
  
  pinTask = (task) => {
    this.setState({pinned: task}, this.storeData);
  }
  
  expandAfter = () => {
    if (this.state.pinnedSelected) {
      console.log('here');
      this.expansionCurrent(this.state.pinned, true);
    } else {
      this.state.selTask.expansion(true);
    }
  }

  displayTaskButtons = () => {
    const rename = (value) => {
      this.state.selTask.setName(value);
      this.setState({selTask: this.state.selTask}, this.storeData);
    };
    const kirametal = (value) => {
      if (value === '0') {
        this.state.selTask.deleteKirametal();
      } else {
        const xsx = (value ? value : '8h/16h');
        if (xsx) {
          this.state.selTask.setKirametal(xsx);
          this.expandAfter();
        }
      }
      this.setState({selTask: this.state.selTask}, this.storeData);
    };
    const dtime = (value) => {
      if (value) {
        this.state.selTask.doDtime(value);
        this.setState({selTask: this.state.selTask}, this.storeData);
      }
    };
    const since = (value) => {
      this.state.selTask.setSince();
      this.setState({selTask: this.state.selTask}, this.storeData);
    };
    const aimd = (value) => {
      this.state.selTask.setAimd();
    }
    const timer = (value) => {
      if (value === '0') {
        this.state.selTask.deleteTimer();
      } else {
        const time = (value ? value : '0');
        if (time !== null) {
          this.state.selTask.setTimer(time);
          this.expandAfter();
        }
      }
      this.setState({selTask: this.state.selTask}, this.storeData);
    };
    return (
      <View>
        {this.button('Pin', (vlue) => this.pinTask(this.state.selTask))}
        {this.input('Rename', (value) => rename(value.nativeEvent.text))}
        {this.input('Timer', (value) => timer(value.nativeEvent.text))}
        {this.input('Kirametal', (value) => kirametal(value.nativeEvent.text))}
        {this.input('Since', (value) => since(value.nativeEvent.text))}
        {this.button('AIMD', (value) => aimd(value.nativeEvent.text))}
        {this.input('Dtime', (value) => dtime(value.nativeEvent.text))}
        {this.button('Delete', (value) => this.deleteTask(this.state.selTask))}
      </View>
    );
  }

  onPressMove = (task, move, subtask) => {
    if (this.state.selTask && move === 0) {
      this.state.moves.M = (this.state.moves.M ? null : task);
      this.setState({moves: this.state.moves, selTask: null, pinnedSelected: false}, this.storeData); 
    } else if (this.state.selTask && move === 1 && this.state.moves.M) {
      this.state.moves.R = task;
      const M = this.state.moves.M;
      const R = this.state.moves.R;
      if (!subtask) {
        const index = (R.parent.subtasks.indexOf(R) + (this.state.moves.direction === 0 ? 1 : 0));
        if (M.parent !== R.parent) {
          M.parent.deleteTask(M);
          R.parent.addTask(M, index);
        } else {
          M.parent.moveTask(M, index);
        }
      } else {
        M.parent.deleteTask(M);
        R.addTask(M);
      }
      this.state.moves.M = null;
      this.state.moves.R = null;
      this.setState({moves: this.state.moves, selTask: null, pinnedSelected: false}, this.storeData); 
    }
  }
  
  moveControls = () => {
    const moves = {0: 'M', 1: 'R'};
    const direction = {0: '↓', 1: '↑'};
    const subtaskText = 'st';
    const textL = (text, sep) => {
      return ('«(' + text + ')»' + (sep ? '  ' : ''));
    }
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => {
            this.state.moves.subtask = !this.state.moves.subtask;
            this.setState({moves: this.state.moves}, this.storeData);
          }}
        >
          <Text style={this.state.moves.subtask ? styles.taskTextSel : styles.taskText}>
            {textL(subtaskText, true)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.state.moves.direction = (this.state.moves.direction + 1) % 2;
            this.setState({moves: this.state.moves}, this.storeData);
          }}
        >
          <Text style={styles.taskText}>
            {textL(direction[this.state.moves.direction], true)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.onPressMove(this.state.selTask, 0, this.state.moves.subtask)}
        >
          <Text style={this.state.moves.M ? styles.taskTextSel : styles.taskText}>
            {textL(moves[0], true)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.onPressMove(this.state.selTask, 1, this.state.moves.subtask)}
        >
          <Text style={this.state.moves.R ? styles.taskTextSel : styles.taskText}>
            {textL(moves[1], true)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }  
  
  canExpandCurrent = (task) => {
    return (task.timestamp || task.since);
  }

  expansionCurrent = (task, exp) => {
    if (!this.canExpandCurrent(task)) {
      this.state.expandCurrent = false;
    } else {
      this.state.expandCurrent = (exp ? exp : !this.state.expandCurrent);
    }
    this.setState({expandCurrent: this.state.expandCurrent});
    return this.state.expandCurrent;
  }

  onPressCurrent = (task) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.expansionCurrent(task);
    this.setState({pinned: this.state.pinned}, this.storeData);
  }

  pinnedDisplay = (task) => {
    if (!task) {return;}
    currentAdjustExpansion = () => {
      if (!this.canExpandCurrent(task)) {
        this.state.expandCurrent = false;
      }
      return this.state.expandCurrent;
    }
    return (
      <TouchableOpacity
        style={[styles.itemCurrent]}
        onPress={() => this.onPressCurrent(task)}
        activeOpacity={0.8}
      >
      <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity //left button
              style={
                this.state.selTask === task 
                ? (this.state.pinnedSelected ? styles.roundButtonSel : styles.roundButtonSel1)
                : styles.roundButton
              }
              onPress={() => this.onPressRound(task, true)}
            >
            </TouchableOpacity>
            <Text>
              {'  '}{task.display(
                () => this.onPressRound(task, true), this.canExpandCurrent(task), this.state.expandCurrent
              )}
            </Text>
          </View>
          <View style={{ flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => this.onPressRight(task)} //right button
            >
              {task.rightText()}
            </TouchableOpacity>
          </View>
        </View>
        {currentAdjustExpansion()
        ? <View style={task.timestamp && task.since
              ? { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, }
              : { flexDirection: 'row', justifyContent: 'center' , marginBottom: 10, }
              }
          >
            {task.timestamp ? task.timer() : null}
            {task.since ? task.kirametal() : null}
          </View>
        : null
        }
      </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
    <View style={styles.mainView}>
      <ScrollView contentContainerStyle={styles.top}>
        {this.state.selTask ? this.displayTaskButtons() : null}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.svcontainer}>
        {this.displayAllTasks()}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.bottom}>
        {this.pinnedDisplay(this.state.pinned ? this.state.pinned : null)}
        {this.addTaskForm()}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>{this.moveControls()}</View>
      </ScrollView>
      <StatusBar backgroundColor='black' translucent={true} />
    </View>
    );
  }
}



