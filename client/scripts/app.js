// YOUR CODE HERE:
//
var app = {
  init: function(){
    //init code here
    $('#send').on('submit', this.handleSubmit);

    $('#roomSelector').change(function(evt){
      evt.preventDefault();
      var selectedRoom = $('#roomSelector').val();
      app.currentRoom = selectedRoom;
      app._refresh();
    });

    $('#createRoom').on('submit',function(evt){
      evt.preventDefault();
      var newRoom = $('#roomInput').val();
      var dropDown = $('#roomSelector');
      var newOption = '<option value=' + newRoom +
          '>' + app._capitalize(newRoom) + '</option>';
      console.log('create room:' + roomSelector);
      dropDown.append(newOption);
      $('#roomInput').val('');
    });


    // List of HTML entities for escaping.
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    // Regex containing the keys listed immediately above.
    var htmlEscaper = /[&<>"'\/]/g;

    // Escape a string for HTML interpolation.
    this._escape = function(string) {
      return ('' + string).replace(htmlEscaper, function(match) {
        return htmlEscapes[match];
      });
    };

    // this.server = 'http://127.0.0.1:3000/1/classes/chatterbox';
    this.server = 'http://127.0.0.1:3000/classes/messages';
    this.currentRoom = 'lobby';
    this.username = 'manu';
    this.friends = {};
    this._refresh();

    var attackMsg = '<script>prompt("What is your name")</script>';
    var msgObj = {
      username: attackMsg,
      roomname: 'lobby',
      text: 'hello world'
    };
    var context = this;
    // setInterval( function(){
    //   context.send(msgObj)}, 5000);


    //ADD THIS BACK IN
    setInterval( this._refresh.bind(this), 1000);
  },

  handleSubmit: function(evt){
    evt.preventDefault();
    // console.log('insdie chat input');
    var message = {
      text: $('#send .submit').val(),
      username: app.username,
      roomname: app.currentRoom
    };
    app.send(message);
    $('#send .submit').val('');
  },

  send: function(message){
    //send code here
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data){
        console.log('chatterbox: Message sent');
      },
      error: function(data){
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  fetch: function(callback){
    //fetch code here
    $.ajax({
      url: this.server,
      type: "GET",
      dataType: 'json',
      data: {
        limit: 30,
        order: '-createdAt'
      },
      success: function(data){
        callback(data);
      },
      error: function(xhr,status){
        console.log(xhr.statusText);
      }
    });
  },

  clearMessages: function() {
    $('#chats').empty();
  },

  addMessage: function(message) {
    var newName = app._escape(message.username);
    var newText = app._escape(message.text);
    if (this.friends[newName]) {
      newText = '<b>' + newText + '</b>';
    }
    var createdAt = app._escape(message.createdAt);
    var newMessage  = $('<li><a href=#>'
    + newName + '</a>: ' + newText + '</li>');
    newMessage.addClass('username');

    $(newMessage).on('click', app.addFriend);

    // var newMessage  = $('<li>' + message.username + ': ' + message.text + '</li>');
    $('#chats').append(newMessage);
  },

  addRoom: function(roomName) {
    var newRoom = $('<button type="button">' + roomName + '</button>');
    newRoom.data("roomName", roomName);
    newRoom.on("click", function(event) {
      app.currentRoom = roomName;
      app.clearMessages();
      app.fetch(function(messages) {
        messages = _.filter(messages, function(message) {
          return message.roomname === roomName;
        });
        _.each(messages, function(message) {
          app.addMessage(message);
        });
      });
    });
    $('#roomSelect').append(newRoom);
  },

  addFriend: function(evt) {
    evt.preventDefault();
    var newFriend = evt.target.text;
    app.friends[newFriend] = true;
  },

  _capitalize: function(inputStr){
    return inputStr.charAt(0).toUpperCase() + inputStr.substring(1);
  },

  _refresh: function() {

    app.fetch(function(messages) {
      messages = messages.results;

      messages = _.filter(messages,function(message){
        return message.roomname === app.currentRoom;
      });

      app.clearMessages();

      _.each(messages, function(message) {
        app.addMessage(message);
      });

      $('#main').find('.username').on('click', function() {
        console.log('clicked!');
      });
      // $('#main').find('.username').click(app.addFriend);
    });
  }
};

app.init();
