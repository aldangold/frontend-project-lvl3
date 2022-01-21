import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import handler from './view';
import parser from './parser';
import resources from './locales/index';
import 'bootstrap';

const getValidator = () => {
  const schema = yup.string().url('noValid');
  return (url, feeds) => schema.notOneOf(feeds, 'notOneOf').validate(url);
};

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const createDataFeed = (url, data) => {
  const id = _.uniqueId();
  return {
    id,
    url,
    title: data.title,
    description: data.description,
  };
};

const createDataPosts = (feedID, data) => {
  const dataPosts = data.items.reverse().map((post) => {
    const postID = _.uniqueId();
    const { title, description, link } = post;
    return {
      id: postID,
      feedID,
      title,
      description,
      link,
    };
  });
  return dataPosts;
};

const createDataReaded = (data) => {
  const dataReaded = data.map((post) => {
    const { id } = post;
    return { postId: id, readed: false };
  });
  return dataReaded;
};

const updateDataPosts = (id, data, state) => {
  const dataPosts = createDataPosts(id, data);
  const dataReaded = createDataReaded(dataPosts);

  state.posts.push(...dataPosts);
  state.uiState.accordion.push(...dataReaded);
};

const updateTime = 5000;

const updateFeeds = (state) => {
  const promises = state.feeds.map((feed) => axios.get(getProxyUrl(feed.url))
    .then((response) => {
      const { id } = feed;
      const newPosts = parser(response.data.contents).items;
      const oldPosts = state.posts.filter((p) => p.feedID === id);
      const diffPosts = _.differenceWith(
        newPosts, oldPosts, (a, b) => a.title === b.title,
      );

      if (diffPosts.length > 0) {
        const diffData = {
          items: diffPosts,
        };
        updateDataPosts(id, diffData, state);
      }
    })
    .catch((err) => {
      state.form.message = err;
    }));
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(state), updateTime));
};

const addFeed = (url, data, state) => {
  const dataFeed = createDataFeed(url, data);
  const { id } = dataFeed;
  const dataPosts = createDataPosts(id, data);
  const dataReaded = createDataReaded(dataPosts);

  state.urls.push(url);
  state.feeds.push(dataFeed);
  state.posts.push(...dataPosts);
  state.uiState.accordion.push(...dataReaded);
};

export default () => i18next.init({
  lng: 'en',
  debug: true,
  resources,
})
  .then(() => {
    const state = {
      form: {
        processState: '',
        message: null,
      },
      urls: [],
      feeds: [],
      posts: [],
      uiState: {
        modal: null,
        accordion: [],
      },
    };

    const elements = {
      form: document.querySelector('.rss-form'),
      input: document.getElementById('url-input'),
      button: document.querySelector('[type="submit"]'),
      feedback: document.querySelector('.feedback'),
      containerFeeds: document.querySelector('.feeds'),
      containerPosts: document.querySelector('.posts'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    };

    const watchedState = onChange(state, handler(elements));
    const validate = getValidator();

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');

      validate(url, state.urls).then((link) => {
        watchedState.uiState.containers = 'rendered';
        watchedState.form.processState = 'processing';
        return axios.get(getProxyUrl(link));
      }).then((response) => {
        const data = parser(response.data.contents);
        addFeed(url, data, watchedState);

        watchedState.form.processState = 'success';
        watchedState.form.message = 'success';
      }).catch((err) => {
        watchedState.form.processState = 'error';
        if (err.message === 'Network Error') {
          watchedState.form.message = 'networkError';
        } else if (err.name === 'ValidationError') {
          watchedState.form.message = err.message;
        } else {
          watchedState.form.message = 'dataError';
        }
      });
    });

    elements.containerPosts.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (id) {
        const [reviewPost] = watchedState.posts.filter((p) => p.id === id);
        watchedState.uiState.modal = reviewPost;
        watchedState.uiState.accordion.push({ postId: id, readed: true });
      }
    });
    updateFeeds(watchedState);
  });
