/**
 * Created by Dmitry Bezugly on 04.11.2016.
 */

'use strict';

var load = require('./load');
var Review = require('./review');
var filters = require('./filters');

module.exports = (function() {
  var DATA_URL = '/api/reviews';
  var PAGE_LIMIT = 3;

  var moreReviewsBtn = document.querySelector('.reviews-controls-more');

  var paramsToLoad = {
    from: 0,
    to: PAGE_LIMIT,
    filter: 'reviews-all'
  };

  var reviews = {
    /**
     * Загрузка данных по отзывам
     */
    loadReviews: function() {
      filters.hideFilters();

      // Если в localStorage записан фильтр, применяем
      if (localStorage.getItem('filter')) {
        paramsToLoad.filter = localStorage.getItem('filter');
      }

      load(DATA_URL, paramsToLoad, this.render);
    },

    /**
     * Рендер отзывов
     * @param {Array} data массив полученных с сервера данных
     */
    render: function(data) {
      if (data.length === PAGE_LIMIT) {
        moreReviewsBtn.classList.remove('invisible');
      } else {
        moreReviewsBtn.classList.add('invisible');
      }

      if (data.length > 0) {
        filters.showFilters();

        filters.setCurrentFilter();

        var reviewListElement = document.querySelector('.reviews-list');

        data.forEach(function(item) {
          var review = new Review(item);
          reviewListElement.appendChild(review);
        });
      }
    },

    /**
     * Удаление списка отзывов
     */
    remove: function() {
      var reviewListElement = document.querySelector('.reviews-list');

      reviewListElement.innerHTML = '';

      paramsToLoad.from = 0;
    }
  };

  /**
   * Событие загрузки отзывов
   * @type {Element}
   */
  moreReviewsBtn.addEventListener('click', function() {
    var pageDifference = paramsToLoad.to - paramsToLoad.from;

    paramsToLoad.from += pageDifference;
    paramsToLoad.to += pageDifference;

    load('/api/reviews', paramsToLoad, reviews.render);
  });

  /**
   * Событие фильтрации
   * @type {Element}
   */
  var filterList = document.querySelector('.reviews-filter');

  filterList.addEventListener('change', function(e) {
    var target = e.target;

    if (target.name === 'reviews') {
      reviews.remove();

      paramsToLoad.from = 0;
      paramsToLoad.to = PAGE_LIMIT;
      paramsToLoad.filter = target.id;

      // Запись фильтра в localStorage
      localStorage.setItem('filter', target.id);
      load('/api/reviews', paramsToLoad, reviews.render);
    }
  }, true);

  return reviews;
})();
