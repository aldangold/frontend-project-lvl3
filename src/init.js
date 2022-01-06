/* eslint-disable no-param-reassign, no-console  */
import * as yup from 'yup';
import onChange from 'on-change';

const handleProcessErrors = (elements, processErrors) => {
  switch (processErrors) {
    case 'novalid':
      elements.feedback.innerHTML = 'Ссылка должна быть валидным URL';
      break;

    case 'notOneOf':
      elements.feedback.innerHTML = 'Уже загружен';
      break;

    default:
      // https://ru.hexlet.io/blog/posts/sovershennyy-kod-defolty-v-svitchah
      throw new Error(`Unknown process state: ${processErrors}`);
  }
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'sent':
      elements.inputField.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.inputField.value = '';
      elements.inputField.focus();
      elements.feedback.classList.add('text-success');
      elements.feedback.innerHTML = 'URL успешно загружен';
      break;

    case 'error':
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.inputField.classList.add('is-invalid');
      elements.inputField.focus();
      break;

    default:
      // https://ru.hexlet.io/blog/posts/sovershennyy-kod-defolty-v-svitchah
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.error':
      handleProcessErrors(elements, value);
      break;

    default:
      break;
  }
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    inputField: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    containerFeeds: document.querySelector('.container-xxl').querySelector('.feeds'),
  };

  const state = onChange({
    form: {
      processState: 'waiting',
      valid: '',
      error: '',
    },
    feeds: {
      processState: '',
      urls: [],
    },
  }, render(elements));

  const validate = (url, list) => {
    const schema = yup.string().url('novalid').notOneOf(list, 'notOneOf');
    try {
      schema.validateSync(url);
      state.form.processState = 'sent';
      state.feeds.urls.push(url);
    } catch (err) {
      state.form.processState = 'error';
      state.form.error = err.message;
    }
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(url, state.feeds.urls);
  });
};
