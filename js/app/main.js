define(["jquery", "app/flickrgallery"], function ($) {
    $(function ($) {
        console.log('init main');
        jQuery('#flickrGallery').flickrGallery({
        	initialSearchQuery: "shoreditch street art",
        	sort: "interestingness-asc"
        });
    });
});