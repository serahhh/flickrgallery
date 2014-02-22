requirejs.config({
    'baseUrl': 'js/vendor',
    'shim': {
        'jquery.blImageCenter': ['jquery'],
        'jqueryui': ['jquery']
    },
    'paths': {
        'app': '../app',
        'template': '../../template',
        'jquery': 'jquery-1.10.1.min',
        'jqueryui': 'jquery-ui-1.10.4.custom.min'
    },
    'hbs': {
        disableI18n: true
    },
});

// Load the main app module to start the app
requirejs(['app/main']);