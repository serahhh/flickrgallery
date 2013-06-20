define('template/helpers/pagination', ['Handlebars'], function (Handlebars) {

    var pagination = function (resultTotal, currentPage, perPage, maxPaginationLinks, nextText, prevText, options) {
        var totalPages = Handlebars.helpers.total_pages.call(this, resultTotal, perPage),
            buffer = "",
            i,
            len,
            edges = 2,
            adjacents = 1,
            maxPages = 20,
            lastPage = totalPages <= maxPages ? totalPages : maxPages,
            minLimit = (edges * 2) +
                1 + // the current page
                (adjacents * 2) +
                2; // the separators

        if (lastPage > 1) {
            buffer += options.fn({
                role: "previous",
                val: prevText,
                active: currentPage !== 1
            });

            if (totalPages < minLimit) {
                for (i = 1; i <= totalPages; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }
            } else if (currentPage - 1 < (minLimit - 1) / 2 + 1) {
                for (i = 1; i <= currentPage + 1 || i <= edges; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }

                buffer += options.inverse();

                for (i = lastPage - edges + 1; i <= lastPage; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }
            } else if (currentPage + 1 > lastPage - (minLimit - 1) / 2) {
                for (i = 1; i <= edges; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }

                buffer += options.inverse();

                i = currentPage - 1 > lastPage - edges + 1 ? currentPage - edges + 1 : currentPage - 1;
                while (i <= lastPage) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                    i++;
                }
            } else {
                for (i = 1; i <= edges; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }

                buffer += options.inverse();

                for (i = currentPage - adjacents, len = currentPage + adjacents; i <= len; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }

                buffer += options.inverse();

                for (i = lastPage - edges + 1; i <= lastPage; i++) {
                    buffer += options.fn({
                        val: i,
                        active: currentPage !== i
                    });
                }
            }

            buffer += options.fn({
                role: "next",
                val: nextText,
                active: currentPage !== lastPage
            });
        }

        return buffer;
    };

    Handlebars.registerHelper('pagination', pagination);

    return pagination;
});




