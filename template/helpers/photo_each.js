define('template/helpers/photo_each', ['Handlebars'], function (Handlebars) {
    function photo_each (photos, basePictureURL, size, options) {
        var buffer = "",
            i,
            len,
            item;

        for (i = 0, len = photos.length; i < len; i++) {
            item = photos[i];

            item.flickr_url = Handlebars.helpers.flickr_url.call(null, item, basePictureURL, size);

            buffer += options.fn(item);
        }

        return buffer;
    }

    Handlebars.registerHelper('photo_each', photo_each);

    return photo_each;
});