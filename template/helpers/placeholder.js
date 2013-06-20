define('template/helpers/placeholder', ['Handlebars'], function (Handlebars) {
    var placeholder = function (searchQuery, placeholderText) {
        return searchQuery ? "" : placeholderText;
    };

    Handlebars.registerHelper('placeholder', placeholder);

    return placeholder;
});