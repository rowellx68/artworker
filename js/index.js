'use strict';
const remote = require('electron').remote;
const dialog = remote.dialog;
let request = require('request');

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

function displayMessage(string) {
  $('.splash-message').text(string);
}

function displayNoResult() {
  displayMessage('No result for \'' + getSearchTerm() + '\'!');
}

function generateSearchUrl() {
  const baseUrl = 'http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?term=<%TERM%>&country=<%COUNTRY%>&entity=<%ENTITY%>';
  var url = baseUrl.replace('<%TERM%>', getCleanSearchTerm());
  url = url.replace('<%COUNTRY%>', getCountry());
  return url.replace('<%ENTITY%>', getMediaType());
}

function getSearchResult() {
  let searchUrl = generateSearchUrl();
  request(searchUrl, parseSearchResult);
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

function parseSearchResult(err, res, body) {
  if(!err && res.statusCode === 200) {
    let searchResult = JSON.parse(body);

    if(searchResult.resultCount > 0) {
      displayMessage(searchResult.results.length);
    }
    else {
      console.log(searchResult);
      displayNoResult();
    }
  }

  $('.progress').hide();
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
    $('.progress').show();
    getSearchResult();
  }
  else {
    displayError('Search term can\'t be empty.', 'Please provide a search term and try again.');
  }
});
