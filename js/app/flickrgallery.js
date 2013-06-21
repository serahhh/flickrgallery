/*globals jQuery, $ */
require(['jquery.blImageCenter']);

define(function (require) {
    var $ = require('jquery'),
        Handlebars = require('Handlebars'),
        Utils = require('app/utils'),
        appTemplate = require('hbs!template/app'),
        pluginName = "flickrGallery",
        defaults = {
            apiURL: "http://api.flickr.com/services/rest/",
            basePhotoURL: "http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg",
            baseClickthroughURL: "http://www.flickr.com/photos/{owner}/{id}",
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

            $.ajax({
                type: "GET",
                cache: true,
                url: this.options.apiURL + paramString,
                dataType: 'jsonp',
                success: this.loadPhotosCallback.bind(this)
            });
        },

        render: function () {
            this.$el.empty();
            this.$el.append(appTemplate(this._getRenderData()));
            this.afterRender();
        },

        afterRender: function () {
            if (this.photoData && this.photoData.photo.length) {
                this.hideGrid();
                this.loader = this.$el.find('[data-flickr-role=loader]');
                this.showLoader();
            }

            this.bindEvents();

            this.scrollToTop();
        },

        bindEvents: function () {
            var paginationEl = this.$el.find('[data-flickr-role=pagination]'),
                navEl = this.$el.find('[data-flickr-role=nav]'),
                gridEl = this.$el.find('[data-flickr-role=grid]');

            navEl.on('change', 'select', this.perPageChangeFn.bind(this));
            navEl.on('keypress', '[data-flickr-role=search]', this.searchInputKeydownFn.bind(this));
            navEl.on('focus', '[data-flickr-role=search]', this.searchInputFocusFn.bind(this));
            navEl.on('blur', '[data-flickr-role=search]', this.searchInputBlurFn.bind(this));

            paginationEl.on('click', this.handlePagination.bind(this));
            gridEl.find('.thumbnail img').load(this._getImgLoadFn());

            $(window).resize(Utils.debouncer(this.fixGrid.bind(this)));
        },


        /* UI actions */

        searchInputFocusFn: function (e) {
            e.target.value = "";
        },

        searchInputBlurFn: function (e) {
            e.target.value = this.searchQuery || "";
        },

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

            if (e.keyCode === 13) {
                if (searchTerm) {
                    this.searchForTerm(searchTerm);
                }

                e.preventDefault();
            }

            e.stopPropagation();
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


            if (windowWidth >= 768) {
                newWidth = newHeight = width;
            } else {
                newWidth = newHeight = windowWidth / 2;
            }

            this.$el.find('.thumbnail .img-wrapper').css({
                height: newHeight,
                width: newWidth
            });

            gridImages.centerImage();
        },

        showGrid: function () {
            this.$el.find('[data-flickr-role=grid], [data-flickr-role=pagination]').animate({
                opacity: 1
            }, 200);
        },

        scrollToTop: function () {
            $('html, body').animate({
                scrollTop: '0px'
            }, 800);
        },

        hideGrid: function () {
            this.$el.find('[data-flickr-role=grid], [data-flickr-role=pagination]').css('opacity', '0');
        },

        loadPhotosCallback: function (data) {
            if (data && data.stat === "ok") {
                this.photoData = data.photos;
                this.render();
            } else {
                console.log('Error loading photos.');
            }
        },

        showLoader: function () {
            if (this.loader) {
                this.loader.removeClass('hide');
            }
        },

        hideLoader: function () {
            if (this.loader) {
                this.loader.addClass('hide');
            }
        },

        _getImgLoadFn: function () {
            var loadedImages = 0,
                totalImages = this.$el.find('.thumbnail img').length,
                TIME_OUT = 10000,
                startTime = new Date().getTime();

            return function () {
                loadedImages++;
                if (loadedImages === totalImages || new Date().getTime() - TIME_OUT > startTime) {
                    this.fixGrid();
                    this.hideLoader();
                    this.showGrid();
                }
            }.bind(this);
        },

        _getRows: function () {
            var perRow = this.options.perRow,
                perPage = this.options.perPage,
                photos,
                photo,
                rows = [],
                i = 0,
                j,
                len;

            if (this.photoData && this.photoData.photo.length) {
                while (perPage) {
                    photos = this.photoData.photo.slice(i, i + perRow);

                    for (j = 0, len = photos.length; j < len; j++) {
                        photo = photos[j];
                        photo.src = this._getPhotoSrcURL(photo);
                        photo.clickthroughURL = this._getClickthroughURL(photo);
                    }

                    rows.push(photos);

                    perPage -= perRow;
                    i += perRow;
                }
            }

            return rows;
        },

        _getClickthroughURL: function (photo) {
            return this.options.baseClickthroughURL.supplant($.extend(photo, {
                id: photo.id,
                owner: photo.owner
            }));
        },

        _getPhotoSrcURL: function (photo) {
            return this.options.basePhotoURL.supplant($.extend(photo, {
                size: this.options.pictureSize
            }));
        },

        _getRenderData: function () {
            var opts = this.options;

            return $.extend({}, this.photoData, {
                rows: this._getRows(),
                perPageOptions: opts.perPageOptions,
                currentPage: this.currentPage,
                perPage: opts.perPage,
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