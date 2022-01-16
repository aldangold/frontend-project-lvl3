export default (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'application/xml');

  const error = doc.querySelector('parserError');
  if (error) {
    throw new Error(error.textContent);
  }

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  const postElements = Array.from(doc.querySelectorAll('item'));
  const items = postElements.map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title: postTitle,
      description: postDescription,
      link,
    };
  });

  return { title, description, items };
};
