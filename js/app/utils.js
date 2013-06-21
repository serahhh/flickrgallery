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

/* 
    for crappy IE
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
*/

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
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