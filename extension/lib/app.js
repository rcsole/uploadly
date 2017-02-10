const input = document.createElement('input');
document.body.appendChild(input);

function payload(srcURL) {
  const data = new FormData();
  data.append('image', srcURL);

  return data;
}

function copyToClipboard(link) {
  input.value = link;
  input.focus();
  input.select();
  document.execCommand('copy');
  input.value = '';
}

function notify({ id, link }) {
  const message = `Your image was uploaded succesfully, we copied the link to your clipboard.
You may click on this notification to open the image in a new tab <3
`;

  chrome.notifications.create(id, {
    type: 'image',
    iconUrl: 'icons/128.png',
    imageUrl: `http://i.imgur.com/${id}m.jpg`,
    title: 'Image uploaded!',
    isClickable: true,
    message
  });

  chrome.notifications.onClicked.addListener(notificationId => {
    if (id !== notificationId) return;

    chrome.tabs.create({ url: link });
  });
}

function handleClick({ srcUrl }, tab) {
  chrome.notifications.create(srcUrl, {
    type: 'basic',
    iconUrl: 'icons/128.png',
    title: 'Uploading image!',
    message: 'Please wait <3'
  })

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: { Authorization: `Client-ID ${process.env.CLIENT_ID}` },
    body: payload(srcUrl)
  })
    .then(response => response.json())
    .then(({ data }) => {
      chrome.notifications.clear(srcUrl)
      copyToClipboard(data.link);
      notify(data);
    });
}

chrome.contextMenus.create({
  title: 'Upload to imgur',
  contexts: ['image'],
  onclick: handleClick
});
