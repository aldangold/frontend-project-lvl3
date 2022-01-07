import i18next from 'i18next';

const handleErrors = (elements, processErrors) => {
  elements.feedback.textContent = i18next.t(`errors.${processErrors}`);
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'sent':
      elements.inputField.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.inputField.value = '';
      elements.inputField.focus();
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = 'URL успешно загружен';
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
      handleErrors(elements, value);
      break;

    default:
      break;
  }
};

export default render;
