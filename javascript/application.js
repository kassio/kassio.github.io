function clearTopicSelection() {
  window.location.hash = '';
}

function selectTopic() {
  const location = window.location;

  if (location.pathname !== '/topics') {
    return;
  } else {
    function showOnlyTopic(id) {
      document.getElementById('topics-list').classList.add('single');
      document.getElementById(id).classList.add('show');
    }

    function showAll() {
      document.getElementById('topics-list').classList.remove('single');
      document.querySelectorAll('.topics .topic').forEach(topic => {
        topic.classList.remove('show');
      });
    }

    if (location.hash !== '') {
      const topic = location.hash.replace('#', '');
      const topicElementId = `topic-${topic}`;

      showOnlyTopic(topicElementId);
    } else {
      showAll();
    }
  }
}

document.addEventListener('DOMContentLoaded', selectTopic, false);
window.addEventListener('hashchange', selectTopic, false);
