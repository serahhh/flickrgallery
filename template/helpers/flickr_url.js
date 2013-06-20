define('template/helpers/flickr_url', ['Handlebars'], function (Handlebars) {
    function flickr_url (photo, basePictureURL, size) {
        return basePictureURL.supplant($.extend(photo, { size: size }));
    }

    Handlebars.registerHelper('flickr_url', flickr_url);

    return flickr_url;
});