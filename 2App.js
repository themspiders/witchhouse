import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import Task from './task';
import { toMillis, parseTime } from './utils';

import { TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

import { roundButton } from './styles.js';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Storage } from 'expo-storage'

const styles = StyleSheet.create({
  svcontainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
//    alignItems: 'center',
    justifyContent: 'center',
//    alignItems: 'center',
    color: '#fff',
  },
  top: {
    flexGrow: 1,
//        justifyContent: 'flex-start',
//    alignItems: 'center',
    marginTop: 50,
//    marginLeft: 0,
//    width: '100%',
  },
  container: {
    paddingTop: StatusBar.currentHeight,
    flex: 1,
    backgroundColor: '#fff',
//    alignItems: 'center',
    justifyContent: 'center',
//    alignItems: 'center',
    color: '#fff',
  },
  input: {
    borderColor: 'gray',
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#dc143c',
  },
  item: {
    width: '80%',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingRight: 0,
    overflow: 'hidden',
    paddingVertical: 10,
    marginBottom: 5,
    marginLeft: 10,
  },
  roundButton: {
    ...roundButton,
    backgroundColor: 'violet',
  },
  roundButtonSel: {
    ...roundButton,
    backgroundColor: 'yellow',
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 36,
    marginLeft: 0,
    width: '100%',
//    flexDirection:"row",
  },
});

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.keyDown = {};
    this.nameInput = null;
    this.state = {
      root: new Task('root'),
      selTask: null,
      allTasks: null,
    };
//    this.load();
//    this.readData();
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
    
    const data = {"allTasks": this.state.root};
    try {
      const jsonValue = JSON.stringify(data, replacer, 2)
      console.log('storeData: jsonValue: ', jsonValue);
      await AsyncStorage.setItem('@storage_Key', jsonValue)
    } catch (e) {
      console.log('error saving data');
    }
  }
  
  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@storage_Key');
      const data = (jsonValue ? JSON.parse(jsonValue) : null);
      console.log('data: ', data);
//      console.log('data.subtasks: ', data.subtasks);
      console.log('data.allTasks: ', data.allTasks);
      return (data ? data : null);
    } catch(e) {
      console.log('error reading data: ', e);
    }
  }
  
  async componentDidMount() {
    const addTask = (jtask, parent) => {
      console.log('jtask: ', jtask);
      const expand = jtask.expand;
      const task = new Task(jtask.name, expand);
      parent.addTask(task);
      jtask.tasks.forEach(x => addTask(x, task));
    }
    const data = await this.getData();
    console.log('compDidMount: data: ', data);
    console.log(this.state.root);
//    this.state.root.name = data.allTasks[2].name;
//    data.subtasks.forEach(jtask => addTask(jtask, this.state.root));
    await this.setState({root: this.state.root, allTasks: data.allTasks});
  }
  
  allTasks = () => {
    const addTask = (jtask, parent) => {
      console.log('jtask: ', jtask);
      const expand = jtask.expand;
      const task = new Task(jtask.name, expand);
      parent.addTask(task);
      jtask.subtasks.forEach(x => addTask(x, task));
    }
    if (this.state.allTasks) {
      console.log('allTasks: ', this.state.allTasks);
      this.state.allTasks.forEach(jtask => addTask(jtask, this.state.root));
    }
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
//        editable={false}
      />
    );
  }

  addTask = (taskAdd) => {
    const root = this.state.root;
    const parent = this.state.selTask ? this.state.selTask : this.state.root;
    console.log('add: parent: ', parent.name);
    parent.addTask(taskAdd);
    this.setState({root: root});
    this.storeData();
  }

  addTaskForm = () => {
    const submit = (value) => {
      if (!value) {
        return;
      }
      const task = new Task(value);
      this.addTask(task);
//      this.setState({task: });
      console.log('tasks: ', this.state.root.subtasks);
    };
    return(
      <View>
        {this.input('Name', (value) => submit(value.nativeEvent.text))}
      </View>//
    );
  }

  onPress = (task) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (task.subtasks.length > 0) {
      task.expand = !task.expand;
      this.setState({root: this.state.root});
    }
  };
  
  onPressRound = (task) => {
    const selTask = (this.state.selTask === task ? null : task);
    this.setState({selTask: selTask});
  }

  displayTask = (task, parent) => {
    if (!task) {return;}
    const br = (task.expand && task.subtasks.length > 0 ? '\n' : null);
    return (
      <View>
      <TouchableOpacity
        style={[styles.item, !this.state.root.expand && { height: 40 }]}
        onPress={() => this.onPress(task)}
        activeOpacity={1}
      >
        <View style={{ flexDirection:"row"}}>
        <TouchableOpacity
          style={
            this.state.selTask === task 
            ? styles.roundButtonSel 
            : styles.roundButton
          }
          onPress={() => this.onPressRound(task)}
        >
        </TouchableOpacity>
        <Text>{task.display()}{br}</Text>
        </View>
        {task.expand
         ?
          <View>
            {task.subtasks.map((subtask, index) =>
              this.displayTask(subtask, task))
            }
          </View>//
        : null}
      </TouchableOpacity>
      </View>//
    );
  }

  displayAllTasks = () => {
    return (
      <View>
        {this.displayTask(this.state.root)}
      </View>//
    );
  }
  
  deleteTask = (task) => {
    console.log('task: ', task.name);
    console.log('parent: ', task.parent.name);
    task.parent.deleteTask(task);
    const selTask = (task === this.state.selTask ? null : this.state.selTask);
    this.setState({root: this.state.root, selTask: selTask});
  }

  displayTaskButtons = () => {
    const rename = (value) => {
      if (value) {
        this.state.selTask.setName(value);
        this.setState({selTask: this.state.selTask});
      }
    };
    const kirametal = (value) => {
      if (value) {
//        console.log('kirametal: ', kirametal);
        this.state.selTask.setKirametal("8h/16h");
        this.setState({selTask: this.state.selTask});
      }
    };
    const dtime = (value) => {
      this.allTasks();
      return;
      if (value) {
//        console.log('dtime.target: ', dtime);
        this.state.selTask.doKirametal(value);
        this.setState({selTask: this.state.selTask});
      }
    };
    return(
      <View>
        {this.input('Rename', (value) => rename(value.nativeEvent.text))}
        {this.button('Delete', (value) => this.deleteTask(this.state.selTask))}
        {this.input('Kirametal', (value) => kirametal(value.nativeEvent.text))}
        {this.input('Dtime', (value) => dtime(value.nativeEvent.text))}
      </View>//
    );
  }

  render() {
    return (
    <>
      <ScrollView contentContainerStyle={styles.top}>
        {this.state.selTask ? this.displayTaskButtons() : null}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.svcontainer}>
        {this.displayAllTasks()}
      </ScrollView>
      <View style={styles.bottom}>
        {this.addTaskForm()}
      </View>
    </>
    );
  }
}



