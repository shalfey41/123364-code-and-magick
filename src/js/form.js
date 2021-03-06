'use strict';

module.exports = (function() {
  var formContainer = document.querySelector('.overlay-container');
  var formCloseButton = document.querySelector('.review-form-close');
  var formOpenButton = document.querySelector('.reviews-controls-new');
  var formElement = document.forms.reviewForm;
  var formReviewButtons = formElement.querySelector('.review-form-group-mark');
  var reviewFields = formElement.querySelector('.review-fields');
  var reviewFormFields = formElement.querySelectorAll('.review-form-field');

  var Form = function() {
    this.onClose = null;
    this.RATING_PRECINCT = 3;

    this.initialize();
  };

  Form.prototype = {
    /**
     * Иницилизация фунций при загрузке страницы
     */
    initialize: function() {
      this.initCookie('review-mark');
      this.initCookie('review-name');

      this.checkReviewField();
      this.checkRequiredFields();

      this._initializeFormListeners();
    },

    /**
     * Устанавливает куки при загрузке страницы
     * @param {String} name название куки
     */
    initCookie: function(name) {
      var cookie = Cookies.get(name); // eslint-disable-line
      if (cookie !== undefined) { // eslint-disable-line
        var input = formElement.elements[name];

        if (input.length > 1) {
          input = input[0];
        }

        switch (input.getAttribute('type')) {
          case 'text':
            input.value = cookie;
            break;
          case 'radio':
            document.querySelector('#' + name + '-' + cookie).setAttribute('checked', 'true');
        }
      }
    },

    /**
     * Возвращает время куки
     * @returns {Number}
     */
    getCookieExpires: function() {
      var currentDay = new Date();
      var hooperBirthday = new Date(currentDay.getFullYear(), 11, 9);

      if (hooperBirthday.valueOf() <= currentDay.valueOf()) {
        return Math.ceil(new Date(currentDay - hooperBirthday).valueOf() / 86400000);
      }

      var hooperLastBirthDay = new Date(currentDay.getFullYear() - 1, 11, 9);
      return Math.ceil(new Date(currentDay - hooperLastBirthDay).valueOf() / 86400000);
    },

    /**
     * Открытие модального окна
     */
    open: function() {
      formContainer.classList.remove('invisible');
    },

    /**
     * Закрытие модального окна
     */
    close: function() {
      formContainer.classList.add('invisible');

      if (typeof this.onClose === 'function') {
        this.onClose();
      }
    },

    /**
     * Добавление пункта в «Осталось заполнить»
     * @param {Element} input
     */
    addLabel: function(input) {
      var inputId = input.id;
      var label = reviewFields.querySelector('[for="' + inputId + '"]');

      label.classList.remove('invisible');

      this.removeLabelList();
    },

    /**
     * Удаление пункта в поле «Осталось заполнить»
     * @param {Element} input
     */
    removeLabel: function(input) {
      var inputId = input.id;
      var label = reviewFields.querySelector('[for="' + inputId + '"]');

      label.classList.add('invisible');

      this.removeLabelList();
    },

    /**
     * Скрывает или показывает поле «Осталось заполнить»
     */
    removeLabelList: function() {
      var flag = true;
      var reviewFieldsLabel = document.querySelectorAll('.review-fields-label');

      for (var i = 0; i < reviewFieldsLabel.length; i++) {
        if (!reviewFieldsLabel[i].classList.contains('invisible')) {
          flag = false;

          break;
        }
      }

      if (flag) {
        reviewFields.classList.add('invisible');
      } else {
        reviewFields.classList.remove('invisible');
      }
    },

    /**
     * Отключение/включение кнопки отправки данных
     * @param {Boolean} flag
     */
    disableSubmitButton: function(flag) {
      var submitButton = formElement.querySelector('.review-submit');

      if (flag) {
        submitButton.setAttribute('disabled', 'true');
      } else {
        submitButton.removeAttribute('disabled');
      }
    },

    /**
     * Валидация обязательных полей
     * Проверка на заполнение
     */
    checkRequiredFields: function() {
      var flag = false;

      for (var i = 0; i < reviewFormFields.length; i++) {
        if (reviewFormFields[i].hasAttribute('required')) {
          if (reviewFormFields[i].value.length === 0) {
            flag = true;
            this.addLabel(reviewFormFields[i]);
          } else {
            this.removeLabel(reviewFormFields[i]);
          }
        }
      }

      if (flag) {
        this.disableSubmitButton(true);
      } else {
        this.disableSubmitButton(false);
      }
    },

    /**
     * Делает поле отзыва обязательным/необязательным,
     * в зависимости от рейтинга
     */
    checkReviewField: function() {
      var rating = formReviewButtons.querySelector('[name="review-mark"]:checked');
      var reviewField = document.getElementById('review-text');

      if (+rating.value < this.RATING_PRECINCT) {
        reviewField.setAttribute('required', 'true');
        this.addLabel(reviewField);
      } else {
        reviewField.removeAttribute('required');
        this.removeLabel(reviewField);
      }
    },

    /**
     * Обработчик клика на кнопку закрытия формы
     * @param e - нажатый элемент
     * @private
     */
    _onClickCloseButton: function(e) {
      e.preventDefault();
      this.close();
    },

    /**
     * Обработчик клика на кнопку открытия формы
     * @param e - нажатый элемент
     * @private
     */
    _onClickOpenButton: function(e) {
      e.preventDefault();
      this.open();
    },

    /**
     * Обработчик клика на кнопки рейтинга отзыва
     * @param e - нажатый элемент
     * @private
     */
    _onClickReviewButtons: function(e) {
      var target = e.target || e.srcElement;
      var reviewRating = null;

      // Если нажал на звездочку
      if (target.getAttribute('name') === 'review-mark') {
        reviewRating = +target.value;

        // Записать в куки
        Cookies.set('review-mark', reviewRating, { expires: this.getCookieExpires() }); // eslint-disable-line

        this.checkReviewField();
        this.checkRequiredFields();
      }
    },

    _initializeFormListeners: function() {
      // Закрытие модального окна
      formCloseButton.addEventListener('click', this._onClickCloseButton.bind(this));

      // Открытие модального окна
      formOpenButton.addEventListener('click', this._onClickOpenButton.bind(this));

      // Клик на звезды рейтинга
      formReviewButtons.addEventListener('click', this._onClickReviewButtons.bind(this));

      // Обработчик на инпуты
      reviewFormFields.forEach(function(item) {
        item.addEventListener('input', this._onInput.bind(this));
      }.bind(this));
    },

    _onInput: function(e) {
      var target = e.target;
      // Если поле имени, записать в куки
      if (target.getAttribute('name') === 'review-name') {
        Cookies.set('review-name', target.value, { expires: this.getCookieExpires() }); // eslint-disable-line
      }

      this.checkRequiredFields();
    }
  };

  return Form;
})();
