const button = document.getElementById('replace-button');
const bgImage = document.getElementById('bg-img');
const gifSrc = 'cube.gif';

// Preload the GIF
const gifPreload = new Image();
gifPreload.src = gifSrc;

button.addEventListener('click', () => {
    button.disabled = true;
    bgImage.src = `${gifSrc}?t=${Date.now()}`;

    setTimeout(() => {
        button.disabled = false;
    }, 1900);
});