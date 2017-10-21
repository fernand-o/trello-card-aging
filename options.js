document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var form = $('#form_options').serializeArray();
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.save_options(form);
        window.close();
    });
};

$(document).ready(function(){   

  function input_by_name(elm_name){    
    return $("input[name='"+ elm_name +"']");
  }
  
  function bind_color_input(color_input_name, text_input_name, default_color){
    let color_input = input_by_name(color_input_name);
    let text_input = input_by_name(text_input_name);
        
    color_input.change(function(){
      text_input.val(this.value);
    });
  
    text_input.on('keyup', function(){
      color_input.val(this.value);
    });
  
    color_input.val(default_color);
    text_input.val(default_color);
  }  
  
  bind_color_input('text_color_picker', 'show_age_text_color', '#000000');
  bind_color_input('bg_color_picker', 'show_age_bg_color', '#FFFFFF');    

  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    values = storage.formOptions;
    for (var i = 0; i < values.length; i++) {
      $("input[name='" + values[i].name + "'], select[name='" + values[i].name + "']").val(values[i].value).attr('checked', 'true');            
    }
  });  
});
