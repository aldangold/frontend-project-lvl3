import 'bootstrap';
import * as yup from 'yup';

export default () => {
  const formElement = document.querySelector('.rss-form');
  const feedbackElement = document.querySelector('.feedback');
  const areaInput = formElement.querySelector('.form-control');
  const handle = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(url, feedbackElement, areaInput);
  };
  formElement.addEventListener('submit', handle);
};

const schema = yup.string().url();

  const validate = (url, element, input) => {
    try {
      schema.validateSync(url);
      input.classList.remove('is-invalid');
      element.classList.remove('text-danger');
      element.classList.add('text-success');
      element.innerHTML = 'URL успешно загружен';
    } catch (err) {
      element.classList.remove('text-success');
      element.classList.add('text-danger');
      input.classList.add('is-invalid');
      element.innerHTML = 'Ссылка должна быть валидным URL'
    }
  };
