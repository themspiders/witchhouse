  storeData = async () => {
    const replacer = (key, value) => {
      return (key === 'parent' ? undefined : value);
    }
    await Storage.removeItem({ key: 'allTasks' })  

    const data = {"allTasks": this.state.root.subtasks};

    await Storage.setItem({
      key: 'allTasks',
      value: JSON.stringify(data, replacer, 2),
    });
  }
  
  getData = async () => {
    const data = JSON.parse(
      await Storage.getItem({ key: 'allTasks' })
    );
    console.log('getData: ', data);
    return data;
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
//    console.log(this.state.root);
//    this.state.root.name = data.allTasks[2].name;
//    data.subtasks.forEach(jtask => addTask(jtask, this.state.root));
//    this.setState({root: this.state.root});
  }
