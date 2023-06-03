    try {
      await AsyncStorage.getItem('@storage_Key').then(obj => {
        if (obj == undefined) {
            var obj1 = {};
            obj1.data = {};
            obj1.data.isdirty = true;
            console.log("obj1 = "+ JSON.stringify(obj1));
            AsyncStorage.setItem('@storage_Key', obj1);
            obj = obj1; //THIS IS WHAT I DID!
            console.log("obj = "+ JSON.stringify(obj));
        }
    if(obj.data.isdirty)
    {
        obj.data.isdirty = false;
        AsyncStorage.setItem('listobject',JSON.stringify(obj));
        return AsyncStorage.getItem('listobject');
    }
}).done();

  async getData = () => {
    try {
//      const jsonValue = await AsyncStorage.getItem('@storage_Key')
      await AsyncStorage.getItem('@storage_Key').then(jsonValue => {
        if (jsonValue !== null) {
          const data = JSON.parse(jsonValue);
          console.log('data: ', data);
          console.log('data.subtasks: ', data.subtasks);
          data.subtasks.forEach(jtask => addTask(jtask, this.state.root));
        }
      });
    } catch(e) {
      console.log('error reading data: ', e);
    }
  
  }
  
  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@storage_Key')
      const data = (jsonValue ? JSON.parse(jsonValue) : null);
      console.log('data: ', data);
      console.log('data.subtasks: ', data.subtasks);
      return (data ? data : null);
    } catch(e) {
      console.log('error reading data: ', e);
    }
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
    
    const data = {"allTasks": this.state.root.subtasks};
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
    this.state.root.name = data.allTasks[2].name;
//    data.subtasks.forEach(jtask => addTask(jtask, this.state.root));
    this.setState({root: this.state.root});
  }










      <CountdownCircleTimer
        isPlaying
        key={key}
        duration={duration}
        colors='#FF0051'
      >
        {({ remTime, color }) =>
          <Text style={{ color, fontSize: 20 }}>
            {formathms(fq)}
          </Text>
        }
      </CountdownCircleTimer>











    const kirametal = (value) => {
      this.state.selTask.setKirametal(value ? value : '8h/16h');
      this.state.selTask.expand = true;
      this.setState({selTask: this.state.selTask});
      }
    };
    const dtime = (value) => {
      if (value) {
        this.state.selTask.doKirametal(value);
        this.setState({selTask: this.state.selTask});
      }
    };
    const timer = (value) => {
      this.state.selTask.setTimer(value ? value : 0);
      this.state.selTask.expand = true;
      this.setState({selTask: this.state.selTask});
    };
