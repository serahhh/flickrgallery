define('template/helpers/is_current_per_page_setting', ['Handlebars'], function (Handlebars) {
    function is_current_per_page_setting (val, currentPerPageValue) {
        return currentPerPageValue === val ? "selected" : "";
    }

    Handlebars.registerHelper('is_current_per_page_setting', is_current_per_page_setting);

    return is_current_per_page_setting;
});