var app = {
  init: function() {
    this.Model.Message = Backbone.Model.extend({
      initialize: function(message) {
        this.set({text: message.text});
        this.set({username: message.username});
        this.set({objectId: message.objectId});
        this.set({roomname: message.roomname});
        this.set({createdAt: message.createdAt});
      }
    });

    this.View.Message = Backbone.View.extend({
      initialize: function() {
        this.model.on('change:message', function() {
          this.render();
        });
      },

      render: function() {
        var $user = $('<div>', {class: 'username'}).text(this.model.get('username'));
        var $text = $('<div>', {class: 'text'}).text(this.model.get('text'));
        var $message = $('<div>', {class: 'chat'}).data('id', this.model.get('objectId')).append($user, $text);
        return this.$el.html($message);
      }
    });

    this.View.Room = Backbone.View.extend({
      Ss
    });

    this.Collection = Backbone.Collection.extend({
      model: app.Model,
      url: 'https://api.parse.com/1/classes/chatterbox'
    });
    this.Collection.room = new this.Collection();
    this.server = 'https://api.parse.com/1/classes/chatterbox';
    this.$chats = $('#chats');
    this.loadMessages();
  },

  loadMessages: function() {
    $.ajax({
      url: this.server,
      type: "GET",
      dataType: 'json',
      data: {
        limit: 30,
        order: '-createdAt'
      },
      success: function(data){
        app.processMessages(data.results);
      },
      error: function(xhr,status){
        console.log(xhr.statusText);
      }
    });
  },

  processMessages: function(messages) {
    for (var i = 0; i < messages.length; i++) {
      app.addToDom(messages[i]);
    }
  },

  addToDom: function(message) {
    var newMessage = new app.Model(message);
    var messageView = new app.View({model: newMessage});
    app.$chats.append(messageView.render());
  }
};
