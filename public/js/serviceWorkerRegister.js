if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceWorker.js')
      .then(reg => {
        // console.log('Registered!', reg);
      })
      .catch(err => {
        console.log('Registration failed:', err);
      });
  });
}
else {
  console.log('Service workers are not supported by this browser.');
}