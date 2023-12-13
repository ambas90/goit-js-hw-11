//importy bibliotek
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
axios.defaults.headers.common['x-api-key'] =
  '41220489-c07c1811e7eaf580f7e0f31fa';

//definiowanie zmiennych
let page;
let searchQuery;
let imageCounter = 0;
const imagesPerPage = 40;
let lightbox;

//wyszukiwanie elementów dom
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

//początkowe ukrycie przycisku load-more
loadMoreBtn.style.display = 'none';

// funkcja obsługująca kliknięcia na submit
const handleSubmit = event => {
  event.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  imageCounter = 0;
  searchQuery = searchForm.searchQuery.value;
  fetchImages(page);
};

//funkcja obsługująca kliknięcia na load-more
function handleLoadMore() {
  fetchImages(++page);
}
//funkcja strzelająca do serwera i zwracająca json ze zdjęciami
async function fetchImages(currentpage) {
  const baseUrl = 'https://pixabay.com/api/';
  const searchParams = new URLSearchParams({
    key: '41220489-c07c1811e7eaf580f7e0f31fa',
    q: searchQuery,
    imageType: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: currentpage,
    per_page: imagesPerPage,
  });
  loadMoreBtn.style.display = 'none';
  try {
    const response = await fetch(`${baseUrl}?${searchParams.toString()}`);
    const photos = await response.json();
    photosRenderer(photos);
  } catch (error) {
    Notiflix.Notify.failure(error);
  }
}

//funkcja wyświetlająca galerię zdjęć
function photosRenderer(data) {
  const photosArr = data.hits;
  if (photosArr.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (page === 1) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  imageCounter += imagesPerPage;
  if (imageCounter >= data.totalHits) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.failure(
      "Were sorry, but you've reached the end of search results"
    );
  } else {
    loadMoreBtn.style.display = 'block';
  }

  const html = photosArr
    .map(
      elem => `<div class="photo-card">
      <a class="gallery-item" href=${elem.largeImageURL}>
    <img src=${elem.webformatURL} alt="${elem.tags}" width="300px" height="200px" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes ${elem.likes} </b>
      </p>
      <p class="info-item">
        <b>Views ${elem.views}</b>
      </p>
      <p class="info-item">
        <b>Comments ${elem.comments}</b>
      </p>
      <p class="info-item">
        <b>Downloads ${elem.downloads}</b>
      </p>
    </div>
  </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', html);

  if (page === 1) {
    lightbox = new SimpleLightbox('.gallery a');
  } else {
    lightbox.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

//nasłuchiwanie kliknięcia na submit
searchForm.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);
