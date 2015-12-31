'use strict';
const remote = require('electron').remote;
const shell = remote.shell;
const dialog = remote.dialog;
const fs = require('fs');
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
  $('.results').empty();
  displayMessage('No result for \'' + getSearchTerm() + '\'!');
  $('.splash-message').show();
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
      displayResult(searchResult.results);
      closeModal();
    }
    else {
      displayNoResult();
    }
  }

  $('.progress').hide();
}

function displayResult(results) {
  let template = $('#result-item').html();
  Mustache.parse(template);

  $('.splash-message').hide();
  $('.results').empty();

  for(let result of results) {
    let collectionName = result.collectionName || result.trackName;
    let artistName = result.artistName;
    let itunesUrl = result.collectionViewUrl || result.trackViewUrl;
    let imageUrl = cleanImageUrl(result.artworkUrl60);
    let minWidth = getMediaType() === 'movie' ? 67 : 100;

    let mustacheObj = {
      collectionName: collectionName,
      itunesUrl: generateItunesUrl(itunesUrl),
      artwork200: generateImageUrl(imageUrl, 200),
      artwork600: generateImageUrl(imageUrl, 600),
      artwork000: generateImageUrl(imageUrl, 10000),
      highResAvailable: highResAvailable(imageUrl),
      minWidth: minWidth
    }

    let html = Mustache.render(template, mustacheObj);

    $('.results').append(html);
  }

  attachClickEvents();
}

function cleanImageUrl(url) {
  return url.replace('60x60bb.jpg', '');
}

function generateImageUrl(url, size) {
  return url + size + 'x' + size + 'bb.jpg';
}

function attachClickEvents() {
  itunesButtonEvent();
  downloadButtonEvent();
}

function generateItunesUrl(url) {
  if (process.platform === 'darwin') {
    let newUrl = url.replace('https://', 'itms://geo.');
    newUrl = newUrl.split('?')[0];
    newUrl += '?app=itunes';

    return newUrl;
  }
  else {
    return url;
  }
}

function highResAvailable(url) {
  let regMusic = /\/thumb\/Music[0-9]/g;
  let regVideo = /\/thumb\/Video/g;

  return regMusic.exec(url) != null || regVideo.exec(url) != null;
}

function itunesButtonEvent() {
  $('.button.itunes').on('click', function(ev) {
    ev.preventDefault();
    let url = $(this).data('url');
    shell.openExternal(url);
  });
}

function downloadButtonEvent() {
  $('.download-artwork').on('click', function(ev) {
    ev.preventDefault();

    var imageUrl = $(this).data('image-url');
    var imageName = $(this).data('image-name');
    var imageQuality = $(this).data('image-quality');

    imageName += '-' + imageQuality + '.jpg';

    $('.progress').show(function () {

      let imagePath = dialog.showSaveDialog({
        title: 'Save Album Art',
        defaultPath: remote.app.getPath('downloads') + '/' + imageName,
        callback: function(filename) {
          if (!filename) {
            $('.progress').hide();
          }
        }
      });

      request(imageUrl, downloadImage).pipe(fs.createWriteStream(imagePath));
    });
  });
}

function downloadImage(err, res) {
  if (err) {
    displayError('An error has occured.', 'Please try again.');
  }
  else {
    if (res.statusCode !== 200) {
      displayError('High res image not available', 'It seems that a high resolution version is not available.');
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
