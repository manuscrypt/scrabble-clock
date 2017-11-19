var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
      var elmApp = Elm.Main.embed(document.querySelector(".app"));
      var self = this;
      elmApp.ports.playAudio.subscribe(function (url){
        self.playAudio(url);
      });
      console.log(Media);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    playAudio: function(url) {
      var my_media = new Media(url,
          function () {
              console.log("playAudio():Audio Success");
          },
          function (err) {
              console.log("playAudio():Audio Error: " + err);
          }
      );
      my_media.play();
    }
};

app.initialize();
