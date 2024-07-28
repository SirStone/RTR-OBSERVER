const channel = new BroadcastChannel('sw-messages');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => {
        console.log('Registered!', reg);
      })
      .catch(err => {
        console.log('Registration failed:', err);
      });
  });
}
else {
  console.log('Service workers are not supported by this browser.');
}

var last_update = localStorage.getItem('last_update');
if (last_update) {
  console.log('last_update loaded from localStorage', last_update);
  // check difference from now
  var now = Date.now();
  var diff = now - last_update;

  // minutes
  // diff = Math.floor(diff / 60000);

  console.log('last_update diff', diff);

  // if more than 60 minutes, try to update the serviceWorker
  if (diff > 0) {
    navigator.serviceWorker.getRegistration().then(function (registration) {
      registration.update();
      console.log('ServiceWorker updated');

    })
  }
  else {
    console.log('ServiceWorker not updated');
  }
}
else {
  console.log('last_update not found in localStorage');
}

channel.addEventListener('message', event => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('last_update', event.data.message);
    console.log('last_update saved in localStorage', event.data.message);
  } else {
    console.log('Local storage is not supported by this browser.');
  }
});