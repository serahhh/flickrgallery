/*globals jQuery, $ */
define([
    'jquery',
    'app/utils',
    'hbs!template/app',
    'hbs!template/imageGrid',
    'jquery.blImageCenter',
    'jqueryui'
], function (
    $,
    Utils,
    appTemplate,
    gridTemplate
) {
    'use strict';

    var pluginName = 'flickrGallery',
        defaults = {
            apiURL: 'http://api.flickr.com/services/rest/',
            basePhotoURL: 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg',
            baseClickthroughURL: 'http://www.flickr.com/photos/{owner}/{id}',
            baseParams: {
                'method': 'flickr.photos.search',
                'api_key': '45a83a34e3417bb74aaa6f6acdbac679',
                'format': 'json',
                'jsoncallback': '?',
            },
            pictureSize: 'm',
            perPage: 12,
            perRow: 4,
            perPageOptions: [4, 8, 12, 16],
            paginationLinksEdge: 2,
            paginationLinksAdjacent: 1,
            maxPages: 30,
            sort: 'relevance'
        },

        FlickrGallery = function (element, options) {
            this.element = element;
            this.$el = $(element);
            this.$ = this.$el.find.bind(this.$el);

            this.options = $.extend({}, defaults, options);

            this._defaults = defaults;
            this._name = pluginName;

            this.init();
        };

    $.extend(FlickrGallery.prototype, {
        init: function () {
            this.currentPage = 1;

            if (this.options.initialSearchQuery) {
                this.searchQuery = this.options.initialSearchQuery;
                this.search();
            }

            this.renderAppView();
            this.showLoader();

            this.ui = {
                pagination: this.$('[data-flickr-role=pagination]'),
                nav: this.$('[data-flickr-role=nav]'),
                grid: this.$('[data-flickr-role=grid]'),
                loader: this.$('[data-flickr-role=loader]')
            };

            this.ui.nav.on('change', 'select', this.perPageChangeFn.bind(this));
            this.ui.nav.on('keypress', '[data-flickr-role=search]', this.searchInputKeydownFn.bind(this));
            this.ui.nav.on('focus', '[data-flickr-role=search]', this.searchInputFocusFn.bind(this));
            this.ui.nav.on('blur', '[data-flickr-role=search]', this.searchInputBlurFn.bind(this));
            this.ui.pagination.on('click', this.handlePagination.bind(this));

            if (this.options.initialSearchQuery) {
                this.searchQuery = this.options.initialSearchQuery;
                this.search();
            }
        },

        search: function (params) {
            var paramString = Utils.createParamString($.extend({}, this.options.baseParams, {
                per_page: this.options.perPage,
                text: window.encodeURIComponent(this.searchQuery || this.options.initialSearchQuery),
                sort: this.options.sort
            }, params));

            $.ajax({
                type: 'GET',
                cache: true,
                url: this.options.apiURL + paramString,
                dataType: 'jsonp',
                success: this.loadPhotosCallback.bind(this)
            });

            this.ui.grid.removeClass('visible');
        },

        renderAppView: function () {
            this.$el.empty();
            this.$el.append(appTemplate({
                perPageOptions: this.options.perPageOptions,
                perPage: this.options.perPage,
                searchQuery: this.searchQuery
            }));
        },

        renderPhotos: function (photoData) {
            this.ui.grid.empty();
            this.ui.grid.append(gridTemplate($.extend({}, photoData, {
                rows: this._getRows(photoData),
                searchQuery: this.searchQuery
            })));

            this.afterPhotoRender();
        },

        afterPhotoRender: function () {
            this.bindEvents();
            this.scrollToTop();
        },

        bindEvents: function () {
            this.ui.grid.find('.thumbnail img').load(this._getImgLoadFn());

            this.ui.grid.on('gridLoaded', function () {
                this.fixGrid();
                this.showGrid();

                window.setTimeout(function () {
                    this.hideLoader();
                }.bind(this), 500);

            }.bind(this));

            $(window).resize(Utils.debouncer(this.fixGrid.bind(this)));
        },


        /* UI actions */

        searchInputFocusFn: function (e) {
            e.target.value = '';
        },

        searchInputBlurFn: function (e) {
            e.target.value = this.searchQuery || '';
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

            this.search();
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
                case 'next':
                    this.nextPage();
                    break;
                case 'previous':
                    this.previousPage();
                    break;
                case 'page':
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
            var gridImages = this.ui.grid.find('.thumbnail img'),
                width = this.ui.grid.find('.thumbnail').first().width(),
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
            // this.$el.find('[data-flickr-role=grid], [data-flickr-role=pagination]').animate({
            //     opacity: 1
            // }, 200);

            this.ui.grid.addClass('visible', 2000);
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
            if (data && data.stat === 'ok' && data.photos) {
                this.renderPhotos(data.photos);
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
            this.ui.loader.addClass('hide');
        },

        _getImgLoadFn: function () {
            var loadedImages = 0,
                totalImages = this.$('.thumbnail img').length,
                TIME_OUT = 10000,
                startTime = new Date().getTime();

            return function () {
                loadedImages++;
                if (loadedImages === totalImages || new Date().getTime() - TIME_OUT > startTime) {
                    this.ui.grid.trigger('gridLoaded');
                }
            }.bind(this);
        },

        _getRows: function (photoData) {
            var perRow = this.options.perRow,
                perPage = this.options.perPage,
                photos,
                photo,
                rows = [],
                i = 0,
                j,
                len;

            if (photoData) {
                while (perPage) {
                    photos = photoData.photo.slice(i, i + perRow);

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

    return FlickrGallery;
});