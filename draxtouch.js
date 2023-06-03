        renderContent={({ viewState }) => {
          const receivingDrag = viewState && viewState.receivingDrag;
          const payload = receivingDrag && receivingDrag.payload;
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
                ? styles.roundButtonSel 
                : styles.roundButton
              }
              onPress={() => this.onPressRound(task)}
            >
            </TouchableOpacity>
            <Text>
              {'  '}{task.display()}{br}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.onPressRight(task)} //right button
          >
            {task.rightText()}
          </TouchableOpacity>
        </View>
        
        {task.expand
        ?
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, }}>
          {task.timestamp ? task.timer() : null}
          {task.since ? task.kirametal() : null}
        </View>
        : null
        }
      
        {task.expand
          ? <View style={styles.subtasks}>
              {task.subtasks.map((subtask, index) =>
                <View key={index}>{this.displayTask(subtask, task)}</View>
              )}
            </View>
          : null
        }
      </View>
      </TouchableOpacity>
      );
      }}
