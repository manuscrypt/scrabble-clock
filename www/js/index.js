var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
      screen.orientation.lock('portrait');
      var config = localStorage.getItem("config");
      if (config != null){
        config = JSON.parse(config);
      }
      var elmApp = Elm.Main.embed(document.querySelector(".app"), config);
      var self = this;
      elmApp.ports.playAudio.subscribe(function (url){
        playAudio(getMediaURL(url));
      });
      elmApp.ports.storeConfig.subscribe(function (config){
        console.log(config);
        var json = JSON.stringify(config);
        console.log(json);
        localStorage.setItem("config",json);
      });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function playAudio(url) {
  var my_media = new Media(url,
      function () {
          console.log("playAudio():Audio Success");
      },
      function (err) {
          console.log("playAudio():Audio Error: ")
          console.log(JSON.stringify(err));
      }
  );
  my_media.play();
   setTimeout(function() {
      my_media.stop();
      my_media.release();
   }, 500);

  // Stop recording after 10 seconds
}

function  getMediaURL(s) {
  if(window.device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
  return s;
}

app.initialize();
