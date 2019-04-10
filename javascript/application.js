let app = {};

app.clearTopicSelection = function () {
  window.location.hash = '';
}

app.selectTopic = function () {
  const location = window.location;

  if (location.pathname === '/topics') {
    const showOnlyTopic = function (id) {
      clearShowTopics();
      document.getElementById('topics-list').classList.add('single');
      document.getElementById(id).classList.add('show');
    }

    const showAll = function () {
      clearShowTopics();
      document.getElementById('topics-list').classList.remove('single');
    }

    const clearShowTopics = function () {
      document.querySelectorAll('.topics .topic').forEach(topic => {
        topic.classList.remove('show');
      });
    }

    if (location.hash !== '') {
      const encodedTopic = location.hash.replace('#', '');
      const topic = decodeURIComponent(encodedTopic);
      const topicElementId = `topic-${topic}`;

      showOnlyTopic(topicElementId);
    } else {
      showAll();
    }
  } else {
    return;
  }
}

document.addEventListener(
  'DOMContentLoaded',
  app.selectTopic,
  false
);
window.addEventListener(
  'hashchange',
  app.selectTopic,
  false
);
