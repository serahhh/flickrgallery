define('template/helpers/total_pages', ['Handlebars'], function (Handlebars) {
    var total_pages = function (resultTotal, perPage) {
        return Math.ceil(resultTotal / perPage);
    };

    Handlebars.registerHelper('total_pages', total_pages);

    return total_pages;
});