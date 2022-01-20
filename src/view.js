import i18next from 'i18next';

const renderReaded = (data) => {
  const readedPosts = data.filter((p) => p.readed === true);
  readedPosts.forEach((item) => {
    const id = item.postId;
    const link = document.querySelector(`[data-id="${id}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal');
  });
};

const renderModal = (elements, value) => {
  const {
    title,
    description,
    link,
  } = value;
  elements.modalTitle.textContent = title;
  elements.modalBody.textContent = description;
  elements.fullArticle.setAttribute('href', link);
};

const renderFeeds = (elements, feeds) => {
  elements.containerFeeds.innerHTML = null;
  const divOuter = document.createElement('div');
  const divInner = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');

  h2.textContent = i18next.t('feeds');

  h2.classList.add('card-title', 'h4');
  divInner.classList.add('card-body');
  divOuter.classList.add('card', 'border-0');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.textContent = feed.title;
    p.textContent = feed.description;

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');

    h3.append(p);
    li.append(h3);
    ul.prepend(li);
  });

  divInner.append(h2);
  divOuter.append(divInner);
  divOuter.append(ul);
  elements.containerFeeds.append(divOuter);
};

const renderPosts = (elements, posts) => {
  elements.containerPosts.innerHTML = null;
  const divOuter = document.createElement('div');
  const divInner = document.createElement('div');
  const ul = document.createElement('ul');
  const h2 = document.createElement('h2');

  h2.textContent = i18next.t('posts');

  h2.classList.add('card-title', 'h4');
  divInner.classList.add('card-body');
  divOuter.classList.add('card', 'border-0');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
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

  divInner.append(h2);
  divOuter.append(divInner);
  divOuter.append(ul);
  elements.containerPosts.append(divOuter);
};

const renderMessage = (elements, message) => {
  elements.feedback.textContent = i18next.t(`messages.${message}`);
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'success':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.input.value = null;
      elements.input.focus();
      elements.feedback.classList.add('text-success');
      elements.button.disabled = false;
      elements.input.removeAttribute('readonly');
      break;

    case 'processing':
      elements.input.setAttribute('readonly', 'readonly');
      elements.button.disabled = true;
      break;

    case 'error':
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.input.classList.add('is-invalid');
      elements.input.focus();
      elements.button.disabled = false;
      elements.input.removeAttribute('readonly');
      break;

    default:
      break;
  }
};

const handler = (elements) => (path, value, preValue) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.message':
      renderMessage(elements, value);
      break;

    case 'feeds':
      renderFeeds(elements, value, preValue);
      break;

    case 'posts':
      renderPosts(elements, value, preValue);
      break;

    case 'uiState.modal':
      renderModal(elements, value);
      break;

    case 'uiState.accordion':
      renderReaded(value);
      break;

    default:
      break;
  }
};

export default handler;
