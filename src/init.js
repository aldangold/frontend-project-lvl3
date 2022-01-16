import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import parser from './parser';
import 'bootstrap';

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
      review: 'Просмотр',
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

const createDataFeed = (url, data, state) => {
  const { feeds } = state;
  const id = _.uniqueId();
  const channel = {
    id,
    url,
    title: data.title,
    description: data.description,
  };

  const posts = data.items.map((post) => {
    const postID = _.uniqueId();
    const channelID = id;
    const { title, description, link } = post;
    return {
      id: postID,
      channelID,
      title,
      description,
      link,
    };
  });

  feeds.urls.unshift(url);
  feeds.channels.unshift(channel);
  feeds.posts.unshift(...posts);
};

const updateDataPosts = (id, data, state) => {
  const posts = data.map((post) => {
    const channelID = id;
    const { title, description, link } = post;

    return {
      id,
      channelID,
      title,
      description,
      link,
    };
  });
  state.feeds.posts.unshift(...posts);
};

const updateFeeds = (state) => {
  const promises = state.feeds.channels.map((channel) => axios.get(getProxyUrl(channel.url))
    .then((response) => {
      const { id } = channel;
      const newPosts = parser(response.data.contents).items;
      const oldPosts = state.feeds.posts.filter((p) => p.channelID === id);
      const diffPosts = _.differenceWith(
        newPosts, oldPosts, (a, b) => a.title === b.title,
      );

      if (diffPosts.length > 0) {
        updateDataPosts(id, diffPosts, state);
      }
    })
    .catch((err) => {
      state.form.error = err;
    }));
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(state), 5000));
};

const addFeed = (url, dataFeed, state) => {
  createDataFeed(url, dataFeed, state);
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
        init: false,
        processState: '',
        urls: [],
        channels: [],
        posts: [],
        readed: [],
        modal: null,
      },
    };

    const elements = {
      form: document.querySelector('.rss-form'),
      inputField: document.getElementById('url-input'),
      feedback: document.querySelector('.feedback'),
      containerFeeds: document.querySelector('.feeds'),
      containerPosts: document.querySelector('.posts'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    };

    const watchedState = onChange(state, render(elements));
    const validate = getValidator();

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');

      try {
        validate(url, state.feeds.urls);
        watchedState.feeds.init = true;

        axios.get(getProxyUrl(url))
          .then((response) => {
            const dataFeed = parser(response.data.contents);
            addFeed(url, dataFeed, watchedState);

            watchedState.form.processState = 'success';
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

    elements.containerPosts.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      const [reviewPost] = watchedState.feeds.posts.filter((p) => p.id === id);
      watchedState.feeds.modal = reviewPost;
      watchedState.feeds.readed.push(id);
    });
    setTimeout(() => updateFeeds(watchedState), 5000);
  });
