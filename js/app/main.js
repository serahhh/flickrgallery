define(['jquery', 'app/flickrgallery'], function ($) {
    $(function ($) {
        console.log('init main');
        $('#flickrGallery').flickrGallery({
            initialSearchQuery: 'shoreditch street art',
            sort: 'interestingness-asc'
        });
    });
});