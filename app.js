$(function() {

  var app = {};

  // **********************************************
  // MODEL (TODO ITEM)  ***************************
  // **********************************************

  // MODEL CLASS
  app.TodoItem = Backbone.Model.extend({
    defaults: {
      description: '',
      completed: false
    },
    toggleStatus: function(){
      this.save({
        completed: !this.get('completed')
      });
    }
  });

  // **********************************************
  // COLLECTION (TODO LIST)  **********************
  // **********************************************

  // COLLECTION CLASS
  app.TodoList = Backbone.Collection.extend({
    model: app.TodoItem,
    localStorage: new Store("backbone-todo"),
    remainingItems: function(){
      return this.filter(function(todoItem) {
        return todoItem.get('completed') == false;
      });
    },
    markAllComplete: function(){
      this.each(function(todoItem) {
        todoItem.save({
          completed: true
        });
      });
    },
    markAllIncomplete: function(){
      this.each(function(todoItem) {
        todoItem.save({
          completed: false
        });
      });
    }
  });

  app.todoList = new app.TodoList();

  // **********************************************
  // TODO ITEM VIEW  ******************************
  // **********************************************

  // VIEW CLASS
  app.TodoItemView = Backbone.View.extend({
    className: 'item',
    tagName: 'tr',
    template: _.template($('#item-template').html()),
    events: {
      'click .delete': 'destroy',
      'dblclick label': 'edit',
      'keypress .edit': 'update',
      'click .toggle': 'toggleStatus'
    },
    initialize: function(){
      this.model.on('change', this.render, this);
      this.model.on('update', this.render, this);
      this.model.on('destroy', this.remove, this);
    },
    completed: function(){
      return $('.item').filter('.complete').length;
    }, 
    toggleStatus: function() {
      this.model.toggleStatus();
    },
    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    edit: function(){
      this.$el.addClass('editing');
      this.$('.edit').focus();
    },
    update: function(e){
      if (e.keyCode == 13) {
        this.model.save({ 
          description: $('.editing .edit').val().trim()
        });
        this.$el.removeClass('editing');
      }
    },
    destroy: function() {
      this.model.destroy();
    }
  });

  // **********************************************
  // TODO LIST VIEW  ******************************
  // **********************************************

  app.TodoListView = Backbone.View.extend({
    el: '#container',    
    events: {
      'keypress #new-todo': 'createNewTodo',
      'click #clear-complete': 'clearTasks'
    },
    initialize: function(){
      this.input = this.$('#new-todo');
      app.todoList.on('add', this.addOne, this);
      app.todoList.on('reset', this.addAll, this);
      app.todoList.fetch();
    },
    addOne: function(todoItem){
      var todoItemView = new app.TodoItemView({ model: todoItem });
      $('#list').append(todoItemView.render().el);
    },
    addAll: function(){
      app.todoList.forEach(this.addOne, this);
    },
    createNewTodo: function(e){
      if (e.keyCode != 13 || !this.input.val()){
        return;
      }
      app.todoList.create({ description: this.input.val().trim() });
      this.input.val('');
    }
  });

  app.todoListView = new app.TodoListView();

  // **********************************************
  // FOOTER VIEW  *********************************
  // **********************************************

  app.FooterView = Backbone.View.extend({
    el: '#footer',
    template: _.template($('#footer-template').html()),
    events: {
      'click #all-complete': 'completeTasks',
      'click #all-incomplete': 'uncompleteTasks'
    },
    initialize: function(){
      app.todoList.on('add destroy change', this.render, this);
      this.render();
    },
    render: function() {
      var remaining_items = app.todoList.remainingItems().length;
      this.$el.html(this.template({
        remaining_items: remaining_items
      }));
      return this;
    },
    completeTasks: function(e){
      e.preventDefault();
      app.todoList.markAllComplete();
    },
    uncompleteTasks: function(e){
      e.preventDefault();
      app.todoList.markAllIncomplete();
    }
  });

  app.footerView = new app.FooterView();

  $('#shortcuts-title').on('click', function() {
    $('#shortcuts-text-container').toggle();
  });

});