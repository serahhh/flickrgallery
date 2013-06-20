requirejs.config({
    "baseUrl": "js/vendor",
    "shim": {
        "jquery.blImageCenter": ["jquery"]
    },
    "paths": {
      "app": "../app",
      "template": "../../template",
      "jquery": "jquery-1.10.1.min"
    },

    "hbs": {
        disableI18n: true
    },
});

// Load the main app module to start the app
requirejs(["app/main"]);