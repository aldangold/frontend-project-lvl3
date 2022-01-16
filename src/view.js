import i18next from 'i18next';
import _ from 'lodash';

const renderError = (elements, processErrors) => {
  elements.feedback.classList.add('text-danger');
  elements.inputField.classList.add('is-invalid');
  elements.inputField.value = null;
  elements.inputField.focus();
  elements.feedback.textContent = i18next.t(`errors.${processErrors}`);
};

const renderSuccess = (elements) => {
  elements.inputField.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.inputField.value = '';
  elements.inputField.focus();
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18next.t('success');
};

const initContainer = (elementName, nameContainer) => {
  const divOuter = document.createElement('div');
  const divInner = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');

  h2.textContent = i18next.t(nameContainer);

  h2.classList.add('card-title', 'h4');
  divInner.classList.add('card-body');
  divOuter.classList.add('card', 'border-0');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  divInner.append(h2);
  divOuter.append(divInner);
  divOuter.append(ul);
  elementName.append(divOuter);
};

const makeReaded = (id) => {
  const link = document.querySelector(`[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal');
};

const renderModal = (elements, value) => {
  const {
    id,
    title,
    description,
    link,
  } = value;
  makeReaded(id);
  elements.modalTitle.textContent = title;
  elements.modalBody.textContent = description;
  elements.fullArticle.setAttribute('href', link);
};

const getDifferent = (value, preValue) => {
  const diff = _.differenceWith(
    value, preValue, (a, b) => a.title === b.title,
  );
  return diff;
};

const renderChannel = (elements, value, preValue) => {
  const newChannels = getDifferent(value, preValue);
  const ul = elements.containerFeeds.querySelector('.list-group');
  newChannels.reverse().forEach((channel) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.textContent = channel.title;
    p.textContent = channel.description;

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');

    h3.append(p);
    li.append(h3);
    ul.prepend(li);
  });
};

const renderPosts = (elements, value, preValue) => {
  const newPosts = getDifferent(value, preValue);
  const ul = elements.containerPosts.querySelector('.list-group');
  newPosts.reverse().forEach((post) => {
    const { id, title } = post;
    const button = document.createElement('button');
    const li = document.createElement('li');
    const a = document.createElement('a');

    a.textContent = title;
    button.textContent = i18next.t('review');

    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    a.classList.add('fw-bold');
    a.dataset.id = id;
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');

    li.append(a);
    li.append(button);
    ul.prepend(li);
  });
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'success':
      renderSuccess(elements);
      break;

    case 'error':
      elements.feedback.classList.remove('text-success');
      break;

    case true:
      initContainer(elements.containerFeeds, 'feeds');
      initContainer(elements.containerPosts, 'posts');
      break;

    default:
      // https://ru.hexlet.io/blog/posts/sovershennyy-kod-defolty-v-svitchah
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const render = (elements) => (path, value, preValue) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.error':
      renderError(elements, value);
      break;

    case 'feeds.init':
      handleProcessState(elements, value);
      break;

    case 'feeds.channels':
      renderChannel(elements, value, preValue);
      break;

    case 'feeds.posts':
      renderPosts(elements, value, preValue);
      break;

    case 'feeds.modal':
      renderModal(elements, value);
      break;

    default:
      break;
  }
};

export default render;
