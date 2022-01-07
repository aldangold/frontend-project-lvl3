/* eslint-disable no-param-reassign, no-console  */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view';

const resources = {
  ru: {
    translation: {
      errors: {
        noValid: 'Ссылка должна быть валидным URL',
        notOneOf: 'RSS уже существует',
        dataError: 'Ресурс не содержит валидный RSS',
        networkError: 'Ошибка сети',
      },
      success: 'URL успешно загружен',
    },
  },
};

const getValidator = () => {
  const schema = yup.string().url('noValid');
  return (url, feeds) => schema.notOneOf(feeds, 'notOneOf').validateSync(url);
};

export default () => i18next.init({
  lng: 'ru',
  debug: true,
  resources,
})
  .then(() => {
    const state = {
      form: {
        processState: '',
        error: '',
      },
      feeds: {
        processState: '',
        urls: [],
      },
    };

    const elements = {
      form: document.querySelector('.rss-form'),
      inputField: document.getElementById('url-input'),
      submitButton: document.querySelector('button[type="submit"]'),
      feedback: document.querySelector('.feedback'),
      containerFeeds: document.querySelector('.container-xxl').querySelector('.feeds'),
    };

    const watchedState = onChange(state, render(elements));
    const validate = getValidator();

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');

      try {
        validate(url, state.feeds.urls);
        watchedState.form.processState = 'sent';
        watchedState.feeds.urls.push(url);
      } catch (err) {
        watchedState.form.processState = 'error';
        watchedState.form.error = err.message;
      }
    });
  });
