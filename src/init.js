import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import render, { renderRSS } from './view';

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
      feeds: 'Фиды',
      posts: 'Потоки',
    },
  },
};

const getValidator = () => {
  const schema = yup.string().url('noValid');
  return (url, feeds) => schema.notOneOf(feeds, 'notOneOf').validateSync(url);
};

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const parseContent = (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'application/xml');

  const error = doc.querySelector('parserError');
  if (error) {
    throw new Error(error.textContent);
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;

  const postElements = Array.from(doc.querySelectorAll('item'));
  const items = postElements.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title, description, link,
    };
  });

  return { feedTitle, feedDescription, items };
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
      feedback: document.querySelector('.feedback'),
      containerFeeds: document.querySelector('.feeds'),
      containerPosts: document.querySelector('.posts'),
    };

    const watchedState = onChange(state, render(elements));
    const validate = getValidator();

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');

      try {
        validate(url, state.feeds.urls);

        watchedState.feeds.processState = 'init';
        axios.get(getProxyUrl(url))
          .then((response) => {
            renderRSS(elements, parseContent(response.data.contents));
            watchedState.form.processState = 'sent';
            watchedState.feeds.urls.push(url);
          })
          .catch((error) => {
            if (error.isAxiosError) {
              watchedState.form.error = 'networkError';
            } else {
              watchedState.form.error = 'dataError';
            }
            watchedState.form.processState = 'error';
          });
      } catch (err) {
        watchedState.form.processState = 'error';
        watchedState.form.error = err.message;
      }
    });
  });
