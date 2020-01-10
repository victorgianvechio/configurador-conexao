/* eslint-disable no-undef */
module.exports = $ => {
  $('#footer').load('../../app/view/components/footer.html');
  $(document).ready(() => {
    $('#electron-version').text(process.versions.electron);
    $('#app-version').text('1.0.1');
  });
};
