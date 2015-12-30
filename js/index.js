'use strict';
const remote = require('electron').remote;
const dialog = remote.dialog;

function hideScrollbar() {
  if (process.platform === 'win32') {
    $('.main').addClass('main-no-scrollbar');
  }
}

function displayError(errorMessage, errorDetail) {
  dialog.showMessageBox({
    type: 'error',
    title: 'Error',
    message: errorMessage,
    detail: errorDetail,
    buttons: ['OK']
  });
}

function closeModal() {
  $('.search-modal-overlay').addClass('animated slideOutDown');
  $('.search-modal-overlay').one('webkitAnimationEnd', function() {
    $(this).removeClass('animated slideInUp slideOutDown').hide();
  });

  $('.search-modal').addClass('animated slideOutDown');
  $('.search-modal').one('webkitAnimationEnd', function() {
    $(this).removeClass('animated slideInUp slideOutDown').hide();
  });
}

function displayNoResult() {
  $('.splash-message').text('No result for \'' + getSearchTerm() + '\'!');
}

function generateSearchUrl(term, country, entity) {
  const baseUrl = 'http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?term=<%TERM%>&country=<%COUNTRY%>&entity=<%ENTITY%>';
  var url = baseUrl.replace('<%TERM%>', getCleanSearchTerm());
  url = url.replace('<%COUNTRY%>', getCountry());
  return url.replace('<%ENTITY%>', getMediaType());
}

function getSearchTerm() {
  return $('input[name="search-term"]').val().trim();
}

function getCleanSearchTerm() {
  return encodeURIComponent(getSearchTerm());
}

function getCountry() {
  return $('select[name="country"]').val();
}

function getMediaType() {
  return $('.media-types input[type="radio"]:checked').val();
}

hideScrollbar();

$('.pill-button-container label').on('click', function() {
  $('.pill-button-container label').removeClass('selected');
  $(this).addClass('selected');
});

$('.button.search').on('click', function(ev) {
  ev.preventDefault();
  $('.search-modal-overlay').addClass('animated slideInUp').show();
  $('.search-modal').addClass('animated slideInUp').show();
});

$('.search-modal-overlay').on('click', function() {
  closeModal();
});

$('.cancel-search').on('click', function() {
  closeModal();
});

$('.search-artwork').on('click', function(ev) {
  ev.preventDefault();
  if (getSearchTerm().length > 0) {
    displayNoResult();
    generateSearchUrl();
  }
  else {
    displayError('Search term can\'t be empty.', 'Please provide a search term and try again.');
  }
});
