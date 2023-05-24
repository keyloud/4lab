const app = new Vue({
  el: '#app',
  data: {
    tasks: [],
    newTask: { name: '', time: 0 },
    editingTask: null,
    filter: 'all',
    chartType: 'bar',
    chartData: [],
    myChart: null,
    searchQuery: ''
  },
  methods: {
    addTask: function() {
      const id = Math.floor(Math.random() * 1e6); //Добавление задачи
      const task = {
        id, 
        name: this.newTask.name, 
        time: this.newTask.time, 
        progress: 100,
        description: this.newTask.description 
      };
      this.tasks.push(task);
      this.newTask = {name: '', time: 0, description: ''};
      const intervalId = setInterval(() => { //Перемещение задачи в localstorage
        if (task.progress > 0 && !task.completed) {
          task.progress--;
          const index = this.tasks.findIndex(t => t.id === id);
          this.tasks[index] = task;
          localStorage.setItem('tasks', JSON.stringify(this.tasks)); 
        } else {
          clearInterval(intervalId); //Если время прошло и задача не выполнена, то она записывается как (Дедлайн провален)
          if (!task.completed) {
            task.completed = false;
            task.progress = "Дедлайн провален";
            task.time = 0;
            task.deadline_failed = true;
            const index = this.tasks.findIndex(t => t.id === id);
            this.tasks[index] = task;
            localStorage.setItem('tasks', JSON.stringify(this.tasks)); 
          }
        }
      }, task.time * 600);
    },
    deleteTask: function(id) { //Удаление task
      const index = this.tasks.findIndex(task => task.id === id);
      this.tasks.splice(index, 1);
    },
    editTask: function(task) { //Редактивирование task
      this.newTask = {name: task.name, time: task.time};
      this.editingTask = task;
    },
    updateTask: function() { //Обновление готовой задачи
      const index = this.tasks.findIndex(task => task.id === this.editingTask.id);
      this.tasks[index].name = this.newTask.name;
      this.tasks[index].time = this.newTask.time;
      this.tasks[index].completed = false;
      this.newTask = {name: '', time: 0};
      this.editingTask = null;
    },
    completeTask: function(task) {
      task.completed = !task.completed;
      if (task.completed) {
        task.progress = "Задача завершена";
      }
    },
    drawChart() {
      const filteredTasks = this.filteredTasks;
      const chartProps = {
        labels: filteredTasks.map(task => task.name),
        datasets: [{
          label: 'Task Time',
          data: filteredTasks.map(task => task.time),
          backgroundColor: filteredTasks.map(task => this.getBackgroundColor(task)),
          borderColor: filteredTasks.map(task => this.getBorderColor(task)),
          borderWidth: 1,
          fill: this.chartType === 'line' ? false : undefined,
        }]
      };
      if (this.myChart) {
        this.myChart.destroy();
      }
      const ctx = document.getElementById('myChart').getContext('2d');
      this.myChart = new Chart(ctx, {
        type: this.chartType,
        data: chartProps,
      });
    },
    getBackgroundColor(task) {
      return task.completed ? 'rgba(54, 235, 162, 0.2)' : 'rgba(255, 99, 132, 0.2)';
    },
    getBorderColor(task) {
      return task.completed ? 'rgba(54, 235, 162, 1)' : 'rgba(255, 99, 132, 1)';
    }
  },
  computed: { //ПОИСК
    filteredTasks: function () {
      if (this.filter === 'all') {
        return this.tasks.filter(task => task.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      } else if (this.filter === 'completed') {
        return this.tasks.filter(task => task.completed && task.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      } else if (this.filter === 'incomplete') {
        return this.tasks.filter(task => !task.completed && task.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
    }
  },
  watch: {
    tasks: {
      handler: function () {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
      },
      deep: true
    }
  },
  mounted: function () {  //Функция выполнения задачи
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
      this.tasks = JSON.parse(tasks);
      this.tasks.forEach((task) => {
        if (task.progress > 0 && !task.completed) {
          const intervalId = setInterval(() => {
            if (task.progress > 0 && !task.completed) {
              task.progress--;
              const index = this.tasks.findIndex(t => t.id === task.id);
              this.tasks[index] = task;
              localStorage.setItem('tasks', JSON.stringify(this.tasks));
            } else {
              clearInterval(intervalId);
              if (!task.completed) {
                task.completed = false;
                task.progress = "Дедлайн провален";
                task.time = 0;
                task.deadline_failed = true;
                const index = this.tasks.findIndex(t => t.id === task.id);
                this.tasks[index] = task;
                localStorage.setItem('tasks', JSON.stringify(this.tasks));
              }
            }
          }, task.time * 600);
        }
      });
    }
  },
});