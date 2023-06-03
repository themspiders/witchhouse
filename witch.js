import './witch.css';
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Task from './task';
import Timer from './timer';
import {toMillis, parseTime} from './utils';

const fs = window.require('fs');
const tasksFile = 'src/tasks.json';

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.keyDown = {};
    this.nameInput = null;
    this.state = {
      root: new Task('root'),
      selTask: null,
      hover: false,
      selMul: [],
      dragg: [],
      dragArr: [],
    };
    this.load();
  }

  componentDidMount(){
    document.addEventListener('keydown', this.downHandler);
    document.addEventListener('keyup', this.upHandler);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.downHandler);
    document.removeEventListener('keyup', this.upHandler);
  }

  downKey(key, pressed, down) {
    return (key == pressed && this.keyDown[down]);
  }

  downHandler = (event) => {
    const key = event.key
    this.keyDown[key] = true;
//    console.log('downHandler: ', key);
    if (['ArrowUp', 'ArrowDown'].includes(key)) {
        event.preventDefault();
    }
    if (this.downKey(key, 'Backspace', 'Shift')) {
      if (this.state.selTask) {
        this.deleteTask(this.state.selTask);
      }
    }
    else if (this.downKey(key, 'Enter', 'Shift')) {
      this.nameInput.focus();
    }
    else if (['ArrowUp', 'ArrowDown'].some(arrow => this.downKey(key, arrow, 'Shift'))) {
      if (this.state.selTask) {
        this.moveUpdown(this.state.selTask, (key === 'ArrowUp' ? true : false));
      }
    }
    else if (['ArrowUp', 'ArrowDown'].indexOf(key) > -1) {
      this.selectUpdown(key);
    }
    else if (['ArrowLeft', 'ArrowRight'].indexOf(key) > -1) {
      this.selectLeftright(key);
    }
    else if (key === 'space') {
      const task = this.state.selTask;
      if (task) {
        task.expand = (task.tasks.length === 0 ? true : !task.expand);
        this.setState({selTask: task});
      }
    }
  }

  upHandler = (event) => {
    const key = event.key
//    console.log('upHandler: ', key);
    this.keyDown[key] = false;
  }

  leftRight = (task, left) => {
    let ltask;
    if (left && task.parent.name == 'root') {
      ltask = task;
    } else if (left && task.name !== 'root') {
      ltask = task.parent;
    } else if (!left && task.tasks.length > 0) {
      task.expand = true;
      ltask = task.tasks[0];
    } else if (!left && task.tasks.length === 0) {
      ltask = task;
    }
    return ltask;
  }

  selectLeftright = (key) => {
    if (this.state.root.tasks.length === 0) {
      return;
    }
    if (!this.state.selTask) {
      this.setState({selTask: this.state.root.tasks[0]});
    }
    else {
      this.setState({selTask: this.leftRight(this.state.selTask, key === 'ArrowLeft' ? true : false)});
    }
  }

  prevNext = (task, prev) => {
    let ptask;
    const index = task.parent.tasks.indexOf(task);
    if (index === 0 && prev) {
      ptask = task.parent.tasks[task.parent.tasks.length - 1];
    } else if (index === task.parent.tasks.length - 1 && !prev) {
      ptask = task.parent.tasks[0];
    } else {
      ptask = task.parent.tasks[prev ? index - 1 : index + 1];
    }
    return ptask;
  }

  selectUpdown = (key) => {
    if (this.state.root.tasks.length === 0) {
      return;
    }
    if (!this.state.selTask) {
      this.setState({selTask: this.state.root.tasks[0]});
    }
    else {
      this.setState({selTask: this.prevNext(this.state.selTask, key === 'ArrowUp' ? true : false)});
    }
  }

  moveUpdown = (task, updown) => {
    const tasks = task.parent.tasks;
    const index = tasks.indexOf(task);
    const nindex = (
      updown ?
        (index === 0 ? tasks.length : index - 1)
      : (index === tasks.length - 1 ? 0 : index + 1)
    );
    tasks.splice(index, 1);
    tasks.splice(nindex, 0, task);
    this.setState({root: this.state.root});
  }

  save = () => {
    console.log('save');
    const replacer = (key, value) => {
      return (key === 'parent' ? undefined : value);
    }
    const allTasks = {"allTasks": this.state.root.tasks};
    let data = JSON.stringify(allTasks, replacer, 2);
    fs.writeFile(tasksFile, data, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  load = () => {
    const addTask = (jtask, parent) => {
      const time = (jtask.timer ? jtask.timer.timestamp : null);
      const onComplete = (jtask.name === '' ? this.deleteTask : null);
      const expand = jtask.expand;
      const task = new Task(jtask.name, time, onComplete, expand);
      task.selected = jtask.selected;
      parent.addTask(task);
      jtask.tasks.forEach(x => addTask(x, task));
    }
    fs.readFile(tasksFile, 'utf8', (err, jsonString) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        const data = JSON.parse(jsonString);
        data.allTasks.forEach(task => addTask(task, this.state.root));
        this.setState({root: this.state.root});
      } catch(err) {
        console.log('error parsing json string: ', err);
      }
    })
  }

  addTask = (taskAdd) => {
    const task = this.state.root;
    const parent = this.state.selTask ? this.state.selTask : this.state.root;
    parent.addTask(taskAdd);
    this.setState({root: task}, this.save);
  }

  addTaskForm = () => {
    const handleAdd = (event) => {
      const name = event.target[0].value;
      const time = event.target[1].value;
      if (name === '' && time === '') {
        return;
      }
      const time1 = (time === '' ? null : parseTime(time, null));
      const onComplete = (name === '' ? this.deleteTask : null);
      const task = new Task(name, time1, onComplete);
      this.addTask(task);
    };
    const handleRename = (event) => {
      const name = event.target[0].value;
      const time = event.target[1].value;
      const kirametal = event.target[2].value;
      const dtime = event.target[3].value;
      if ([name, time, kirametal, dtime].every(x => x === '')) {
        return;
      }
      if (name !== '') {
        this.state.selTask.setName(name);
      }
      if (time !== '') {
        if (time.split(' ')[0] === 'all') {
          this.state.selTask.tasks.forEach(
            t => t.setTimer(parseTime(time.split(' ').slice(1), t.time))
          );
        } else if(time.split(' ')[0] === 'spread') {
          let timer = parseTime(time.split(' ').slice(1));
          const length = this.state.selTask.tasks.length;
          const decrement = (timer - Date.now())/length;
          for(let i = length - 1; i >= 0; i--) {
            this.state.selTask.tasks[i].setTimer(timer);
            timer = timer - decrement;
          }
        } else {
          this.state.selTask.setTimer(parseTime(time, this.state.selTask.time));
        }
      }
      if (kirametal !== '') {
        console.log('kirametal: ', kirametal);
        const x = toMillis(kirametal.split('/')[0]);
        const sx = toMillis(kirametal.split('/')[1]);
        this.state.selTask.setKirametal(Date.now(), x, sx);
      }
      if (dtime !== '') {
        console.log('dtime.target: ', dtime);
        this.state.selTask.doKirametal(dtime);
      }
      this.setState({selTask: this.state.selTask}, this.save);
    };
    const handleSubmit = (event) => {
      event.preventDefault()
      const handlers = {
        'add': handleAdd,
        'rename': handleRename,
      }
      handlers[event.nativeEvent.submitter.name](event);
      event.target.reset();
    };
    return(
      <div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <li>
            <input
              type="text" className="input" id="taskName" placeholder="Name"
              ref={(input) => this.nameInput = input}
            />
          </li>
          <li>
            <input
              type="text" className="input" id="timer" placeholder="Timer"
            />
          </li>
          <li>
            <input
              type="text" className="input" id="kirametal" placeholder="Kirametal"
            />
          </li>
          <li>
            <input
              type="text" className="input" id="dtime" placeholder="Dtime"
            />
          </li>
          <br/>
          <Col>
          <button type="submit" className="button" name="add">
            Add
          </button>
          {this.state.selTask
          ? <button type="submit" className="button" name="rename">
              Rename
            </button>
          : null}
          </Col>
        </form>
      </div>
    );
  }

  handleClick = (task, e) => {
    if (e.type === 'click' && this.keyDown['Control']) {
//      console.log('click + control');
      task.select();
      this.setState({root: this.state.root}, this.save);
    }
    else if (e.type === 'click' && this.keyDown['Shift']) {
      const index = this.state.selMul.indexOf(task);
      if (index > -1) {
        this.state.selMul.splice(index, 1);
      } else {
        this.state.selMul.push(task);
      }
      const selTask = (this.state.selTask === task ? null : this.state.selTask);
      this.setState({selTask: selTask, selMul: this.state.selMul});
    }
    else if (e.type === 'click' && !this.keyDown['Shift']) {
      const selTask = (this.state.selTask === task ? null : task);
      const index = this.state.selMul.indexOf(task);
      if (index > -1) {
        this.state.selMul.splice(index, 1);
      }
      this.setState({selTask: selTask, selMul: this.state.selMul});
    }
    else if (e.type === 'contextmenu') {
      task.expand = (task.tasks.length === 0 ? true : !task.expand);
      this.setState({root: this.state.root});
    }
  }

  updateState = (state, callback) => {
    return new Promise(resolve => {
      this.setState(state, callback);
    });
  }

  displayTask = (task, parent) => {
    if (!task) {return;}
    var draggingPos = null;
    var dragOverPos = null;
    const dragStart = (e, position) => {
      const arr = this.state.root.tasks.slice();
      this.setState({dragArr: arr});
      draggingPos = position;
      this.state.dragg.push(task);
    };
    const dragEnter = (e, position) => {
      const arr = [...this.state.root.tasks];
      dragOverPos = position;
    };
    const drop = (e, arr) => {
      draggingPos = null;
      dragOverPos = null;
      return;
      if (this.state.dragg.length > 0 && this.state.dragg[0] === task) {
        const dragging = arr[draggingPos];
        arr.splice(draggingPos, 1);
        arr.splice(dragOverPos, 0, dragging);
        this.setState({root: this.state.root, dragg: []}, this.save);
      }
      this.state.root.tasks = this.state.dragArr;
      this.setState({root: this.state.root});
      draggingPos = null;
      dragOverPos = null;
    };
    const hover = (task) => {
      this.setState({hover: task});
    };
    let className =
      (this.state.selTask === task
      ? (task.selected
        ? "button selected2"
        : "button selected"
        )
      : (task.selected
         ? "button selected1"
         : "button"
         )
      );
    className = (this.state.selMul.indexOf(task) > -1 ? "button selMul" : className);
    className = className + (this.state.hover === task ? " hover" : "");
    return (
      <Row className="task">
        {task.name !== 'root'
        ? <div
            className={className}
            onClick={(e) => this.handleClick(task, e)}
            onContextMenu={(e) => this.handleClick(task, e)}
            onMouseEnter={() => hover(task)}
            onMouseLeave={() => hover(null)}
          >
          {task.display()}
          </div>
        : null}
        {task.expand
         ? <Container>
            {task.tasks.map((subtask, index) =>
              <div
                onDragStart={(e) => dragStart(e, index)}
                onDragEnter={(e) => dragEnter(e, index)}
                onDragEnd={(e) => drop(e, task.tasks)}
                draggable
              >
                <li>{this.displayTask(subtask, task)}</li>
              </div>
            )}
          </Container>
        : null}
      </Row>
    );
  }

  displayAllTasks = () => {
    return (
      <Container>
        {this.displayTask(this.state.root)}
      </Container>
    );
  }
//
  deleteTask = (task) => {
//    console.log('deleteTask: ', task.parent.name);
    task.parent.deleteTask(task);
    const selTask = (task === this.state.selTask ? null : this.state.selTask);
    this.setState({root: this.state.root, selTask: selTask}, this.save);
  }

  selectTask = (task) => {
    const selTask = task;
    selTask.select();
    this.setState({selTask: null}, this.save);
  }

  move = () => {
    const tasks = this.state.selMul;
    const parent = this.state.selTask;
    tasks.forEach(task => {
      task.parent.deleteTask(task);
      parent.addTask(task);
    });
  }

  dtime = () => {
    this.state.selTask.doKirametal('1s');
  }

  displayTaskButtons = () => {
    const taskButtons = [['Delete', this.deleteTask], ['Select', this.selectTask], ['Move', this.move],
        ['Search', this.search], ['Set timer', this.setTimer], ['Dtime', this.dtime]];
    const handler = (h) => {
      let selectedTasks = this.state.selMul;
      selectedTasks = (selectedTasks.indexOf(this.state.selTask) > -1
                        ? selectedTasks
                        : selectedTasks.concat(this.state.selTask)
                      );
      selectedTasks.forEach(task => h(task));
      this.setState({selTask: null, selMul: []}, this.save);
    }
    return (
      <Container>
        <Row>
          {taskButtons.filter((x) => (this.state.selTask.name === 'search' ? true : x[0] !== 'Search'))
            .map(([name, h]) =>
              <button className="button" onClick={() => handler(h)}>
                {name}
              </button>
          )}
        </Row>
      </Container>
    );
  }

  compare = (d1, d2) => {
    const dd1 = new Date(d1);
    const dd2 = new Date(d2);
    return dd1 < dd2;
  }

  search = (timestamp) => {
    const recursive = (task) => {
      if (task.tasks.length === 0) {
        return [task];
      }
      let list = [];
      for(const subtask of task.tasks) {
        if (subtask.name !== 'search') {
          list = list.concat(recursive(subtask));
        }
      }
      return [task].concat(list);
    }
    const all = recursive(this.state.root);
    let filter = all.filter((task) => task.time && this.compare(task.time, this.state.selTask.time));
    filter.sort((x, y) => this.compare(x.time, y.time) ? -1 : 1);
//    console.log('x: ', filter.map((y) => y.name + ' ' + y.time));
    if (this.state.selTask.name === 'search') {
      this.state.selTask.tasks = filter;
//      console.log('search: ', this.state.selTask);
      this.setState({selTask: this.state.selTask});
    }
  }

  render() {
    return (
      <div>
        <style>{'body {color: white; background-color: black;}'}</style>
        <ul>
          <br/>
          <Container>
          <Row>
            <Col>{this.addTaskForm()}</Col>
            <Col>{this.state.selTask || this.state.selMul.length > 0 ? this.displayTaskButtons() : null}</Col>
          </Row>
          </Container>
          <br/>
          {this.displayAllTasks()}
        </ul>
      </div>
    );
  }
}

export default Main;
