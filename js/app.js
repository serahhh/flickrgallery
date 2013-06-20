requirejs.config({
    "baseUrl": "js/vendor",
    "paths": {
      "app": "../app",
      "template": "../../template",
      "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    },

    "hbs": {
        disableI18n: true
    },
});

// Load the main app module to start the app
requirejs(["app/main"]);