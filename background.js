var debugging = false;

function log(text){
  if (debugging)
    console.log(text);
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    if ((changeInfo.title != undefined) && (changeInfo.title.includes('|'))) {
      log('Tab updated');
      log(tab);
      executed = true;
      restore_options_and_execute(tab.id, changeInfo.title, execute_with_config);
    }
});

function save_options(options) {
  log('Saving options:');
  log(options);
  chrome.storage.local.set({
    formOptions: options
  }, function() {
    log('Saved');
    return;
  });
}

function restore_options_and_execute(tabid, title, callback) {

  log('Restoring options');
  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    log('Restored options:');
    log(storage.formOptions);

    config = parse_config(storage.formOptions);
    config.title = title;
    config.tabid = tabid;
    callback(config);
  });
}

function parse_config(options){
  log('Parsing configs');

  config = {
    show_age: false,
    show_age_bg_color: '#000000',
    show_age_text_color: '#cccccc',
    apply_aging: false,
    apply_aging_style: 'pirate'
  };

  if (options.length == 0) {
    log('Config is empty, defining defaults');
    config.show_age = true;
    config.apply_aging = true;
    return config;
  }

  var config = {};
  $.each(options, function(idx, val){
    log('idx[' + idx +'] value:');
    log(val);

    if (val.name == 'show_age')
      config.show_age = (val.value == "on");

    if (val.name == 'show_age_bg_color')
      config.show_age_bg_color = val.value;

    if (val.name == 'show_age_text_color')
      config.show_age_text_color = val.value;

    if (val.name == 'apply_aging')
      config.apply_aging = (val.value == "on");

    if (val.name == 'apply_aging_style')
      config.apply_aging_style = val.value;
  });
  log('Config parsed:');
  log(config);
  return config;
}

function execute_with_config(config){

  log('Executing in Title['+ config.title +'] TabId['+ config.tabid +'] with config:');
  log(config);

  chrome.tabs.executeScript(config.tabid, {
    code: "start_effects_timer('"+ JSON.stringify(config) +"');"
  });
};
