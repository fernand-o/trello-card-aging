document.forms[0].onsubmit = function(e) {
    e.preventDefault();
    var form = $('#form_options').serializeArray();
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.saveConfigs(form);
        window.close();
    });
};

$(document).ready(function(){

  function inputByName(elm_name){
    return $("input[name='"+ elm_name +"']");
  }

  function bindColorInput(colorInputName, textInputName, defaultColor){
    let colorInput = inputByName(colorInputName);
    let textInput = inputByName(textInputName);

    colorInput.change(function(){
      textInput.val(this.value);
    });

    textInput.on('keyup', function(){
      colorInput.val(this.value);
    });

    colorInput.val(defaultColor);
    textInput.val(defaultColor);
  }

  bindColorInput('text_color_picker', 'show_age_text_color', '#000000');
  bindColorInput('bg_color_picker', 'show_age_bg_color', '#FFFFFF');
  bindColorInput('text_color_picker_real_age', 'show_real_age_text_color', '#000000');
  bindColorInput('bg_color_picker_real_age', 'show_real_age_bg_color', '#FFFFFF');

  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    values = storage.formOptions;
    for (var i = 0; i < values.length; i++) {
      $("input[name='" + values[i].name + "'], select[name='" + values[i].name + "']").val(values[i].value).attr('checked', 'true');
    }
  });
});
