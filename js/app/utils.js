/*
    Crockford
    http://javascript.crockford.com/remedial.html
*/
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

var Utils = {
    createParamString: function (params) {
        var paramStr = "",
            param;

        for (param in params) {
            if (params.hasOwnProperty(param)) {
                paramStr = paramStr + (paramStr ? "&" : "?") + param + "=" + params[param];
            }
        }

        return paramStr;
    },

    debouncer: function (fn, timeout) {
        var timeoutID;

        return function () {
            var scope = this,
                args = arguments;

            clearTimeout(timeoutID);

            timeoutID = setTimeout(function () {
                fn.apply(scope, Array.prototype.slice.call(args));
            }, timeout || 200);
        };
    }
};

define(function () {
    return Utils;
});