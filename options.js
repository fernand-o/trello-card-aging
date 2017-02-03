document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var form = $('#form_options').serializeArray();
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.save_options(form);
        window.close();
    });
};

$(document).ready(function(){
  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    values = storage.formOptions;
    for (var i = 0; i < values.length; i++) {
      $("input[name='" + values[i].name + "'], select[name='" + values[i].name + "']").val(values[i].value).attr('checked', 'true');            
    }

  });
});
