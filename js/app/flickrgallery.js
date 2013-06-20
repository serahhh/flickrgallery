/*globals jQuery, $ */
require(['jquery.blImageCenter']);

define(function (require) {
    var $ = require('jquery'),
        Handlebars = require('Handlebars'),
        Utils = require('app/utils'),
        pluginName = "flickrGallery",
        defaults = {
            baseURL: "http://api.flickr.com/services/rest/",
            basePictureURL: "http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg",
            baseParams: {
                "method": "flickr.photos.search",
                "api_key": "45a83a34e3417bb74aaa6f6acdbac679",
                "format": "json",
                "jsoncallback": "?",
            },
            pictureSize: "m",
            perPage: 12,
            perRow: 4,
            perPageOptions: [4, 8, 12, 16],
            paginationLinksEdge: 2,
            paginationLinksAdjacent: 1,
            maxPages: 30,
            sort: "relevance"
        },

        FlickrGallery = function (element, options) {
            this.element = element;
            this.$el = $(element);

            this.options = $.extend({}, defaults, options);

            this._defaults = defaults;
            this._name = pluginName;

            this.init();
        };

    $.extend(FlickrGallery.prototype, {
        init: function () {
            console.log('flickr gallery init!');

            this.templates = {
                app: require('hbs!template/app')
            };

            this.currentPage = 1;

            // do the search?

            if (this.options.initialSearchQuery) {
                this.searchQuery = this.options.initialSearchQuery;
                this.search();
            } else {
                this.render();
            }
        },

        search: function (params) {
            var paramString = Utils.createParamString($.extend({}, this.options.baseParams, {
                per_page: this.options.perPage,
                text: window.encodeURIComponent(this.searchQuery || this.options.initialSearchQuery),
                sort: this.options.sort
            }, params));

            jQuery.ajax({
                type: "GET",
                cache: true,
                url: this.options.baseURL + paramString,
                dataType: 'jsonp',
                success: this.loadPhotosCallback.bind(this)
            });
        },

        render: function () {
            this.$el.empty();
            this.$el.append(this.templates.app(this._getRenderData()));
            this.afterRender();
        },

        afterRender: function () {
            if (this.photoData) {
                this.$el.find('[data-flickr-role=grid], [data-flickr-role=pagination]').css('opacity', '0');
            }

            this.bindEvents();
        },

        bindEvents: function () {
            var paginationEl = this.$el.find('[data-flickr-role=pagination]'),
                navEl = this.$el.find('[data-flickr-role=nav]'),
                gridEl = this.$el.find('[data-flickr-role=grid]');

            navEl.on('change', 'select', this.perPageChangeFn.bind(this));
            navEl.on('keypress', '[data-flickr-role=search]', this.searchInputKeydownFn.bind(this));
            paginationEl.on('click', this.handlePagination.bind(this));
            gridEl.find('.thumbnail img').load(this._getImgLoadFn());

            $(window).resize(Utils.debouncer(this.fixGrid.bind(this)));
        },


        /* UI actions */

        searchForTerm: function (term) {
            this.currentPage = 1;
            this.searchQuery = term;
            this.search();
        },

        nextPage: function () {
            this.goToPage(++this.currentPage);
        },

        previousPage: function () {
            this.goToPage(--this.currentPage);
        },

        goToPage: function (page) {
            this.currentPage = page;
            this.search({
                page: page
            });
        },

        changePerPage: function (val) {
            this.options.perPage = val;

            if (this.photoData.photo.length < val) {
                this.search();
            } else {
                this.render();
            }
        },

        searchInputKeydownFn: function (e) {
            var target = e.target,
                searchTerm = target.value;

            if (e.keyCode === 13 && searchTerm) {
                this.searchForTerm(searchTerm);
                e.preventDefault();
            }
        },

        handlePagination: function (e) {
            var target = $(e.target).closest('[data-flickr-role=previous], [data-flickr-role=next], [data-flickr-role=page]'),
                role = target.data('flickr-role'),
                pageNo;

            if (!target.is('.disabled')) {
                pageNo = parseInt(e.target.innerText, 10);

                switch (role) {
                case "next":
                    this.nextPage();
                    break;
                case "previous":
                    this.previousPage();
                    break;
                case "page":
                    (function () {
                        if (!isNaN(pageNo)) {
                            this.goToPage(pageNo);
                        }
                    }.bind(this)());
                    break;
                }
            }

            e.stopPropagation();
            e.preventDefault();
        },

        perPageChangeFn: function (e) {
            var target = e.target;
            this.changePerPage(parseInt(target.options[target.selectedIndex].value, 10));
        },

        /* some kind of hackery */
        fixGrid: function () {
            var gridEl = this.$el.find('[data-flickr-role=grid]'),
                gridImages = gridEl.find('.thumbnail img'),
                width = gridEl.find('.thumbnail').first().width(),
                newWidth,
                newHeight,
                windowWidth = $(window).width();


            if (windowWidth > 768) {
                newWidth = newHeight = width;
            } else {
                newWidth = newHeight = windowWidth / 2;
            }

            this.$el.find('.thumbnail .img-wrapper').css({
                height: newHeight,
                width: newWidth
            });

            gridImages.centerImage();

            this.$el.find('[data-flickr-role=grid], [data-flickr-role=pagination]').animate({
                opacity: 1
            }, 200);
        },

        loadPhotosCallback: function (data) {
            if (data && data.stat === "ok") {
                console.log(data);
                this.photoData = data.photos;
                this.render();
            } else {
                console.log('Error loading photos.');
            }
        },

        _getImgLoadFn: function () {
            var loadedImages = 0,
                totalImages = this.$el.find('.thumbnail img').length;

            return function () {
                loadedImages++;
                if (loadedImages === totalImages) {
                    this.fixGrid();
                }
            }.bind(this);
        },

        _getRows: function () {
            var perRow = this.options.perRow,
                perPage = this.options.perPage,
                photos,
                rows = [],
                i = 0,
                j,
                len;

            if (this.photoData && this.photoData.photo.length) {
                while (perPage) {
                    photos = this.photoData.photo.slice(i, i + perRow);

                    for (j = 0, len = photos.length; j < len; j++) {
                        photos[j].flickrURL = this._getFlickrURL(photos[j]);
                    }
                    rows.push(photos);

                    perPage -= perRow;
                    i += perRow;
                }
            }

            return rows;
        },

        _getFlickrURL: function (photo) {
            return this.options.basePictureURL.supplant($.extend(photo, {
                size: this.options.pictureSize
            }));
        },

        _getRenderData: function () {
            var opts = this.options;

            return $.extend({}, this.photoData, {
                basePictureURL: opts.basePictureURL,
                rows: this._getRows(),
                size: opts.pictureSize,
                perPageOptions: opts.perPageOptions,
                maxPaginationLinks: opts.maxPaginationLinks,
                currentPage: this.currentPage,
                searchQuery: this.searchQuery,
                totalPages: this._getTotalPages(),
                maxPages: opts.maxPages,
                paginationLinksEdge: opts.paginationLinksEdge,
                paginationLinksAdjacent: opts.paginationLinksAdjacent
            });
        },

        _getTotalPages: function () {
            return Math.ceil(this.photoData.total / this.options.perPage);
        }
    });

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new FlickrGallery(this, options));
            }
        });
    };
});