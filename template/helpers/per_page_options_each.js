define('template/helpers/per_page_options_each', ['Handlebars'], function (Handlebars) {
    function per_page_options_each (perPageOptions, currentValue, options) {
        var buffer = "",
            i,
            len,
            val;

        for (i = 0, len = perPageOptions.length; i < len; i++) {
        	val = perPageOptions[i];

			buffer += options.fn({
            	val: val,
            	selected: val === currentValue ? "selected" : ""
            });
        }

        return buffer;
    }

    Handlebars.registerHelper('per_page_options_each', per_page_options_each);

    return per_page_options_each;
});

