

System.config({
    map: {
        'signals.js': 'libs/js-signals/dist/signals.min.js'
    }
});

window.addEventListener('load', function() {
    console.log('Loading');

    if (window.navigator.standalone == true) {
        $('.hide-fullscreen').addClass('hide');
    }

    System.import('app').then(function(App) {
        var V_RES = 524,

            ASPECT_RATIO = 1.775,

            H_RES = V_RES * ASPECT_RATIO;

        var app = new App.default(H_RES, V_RES);
        app.main();
    });
});
