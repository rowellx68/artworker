'use strict';
const remote = require('electron').remote;
const dialog = remote.dialog;

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
