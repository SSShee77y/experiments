const button = document.getElementById('replace-button');
let bgImage = document.getElementById('bg-img');
const gifSrc = 'cube.gif';

button.addEventListener('click', () => {
    button.disabled = true;
    bgImage.src = `cube.gif?v=${Math.random()}`;

    setTimeout(() => {
        button.disabled = false;
    }, 1900);
});