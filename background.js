chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if ((changeInfo.title != undefined) && (changeInfo.title.includes('|'))) {
    restoreConfigAndExecute(tab.id, executeWithConfig);
  }
});

function saveConfigs(config) {
  chrome.storage.local.set({
    formOptions: config
  });
}

function restoreConfigAndExecute(tabid, callback) {
  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    config = parseConfig(storage.formOptions);
    config.tabid = tabid;
    callback(config);
  });
}

function parseConfig(options){
  config = {
    show_age: false,
    show_age_bg_color: '#000000',
    show_age_text_color: '#cccccc',
    show_real_age: false,
    show_real_age_bg_color: '#38BB3F',
    show_real_age_text_color: '#000000',
    apply_aging: false,
    apply_aging_style: 'pirate'
  };

  if (options.length == 0) {
    config.show_age = true;
    config.apply_aging = true;
    return config;
  }

  var config = {};
  $.each(options, function(idx, val){
    if (val.name == 'show_age')
      config.show_age = (val.value == "on");

    if (val.name == 'show_age_bg_color')
      config.show_age_bg_color = val.value;

    if (val.name == 'show_age_text_color')
      config.show_age_text_color = val.value;

    if (val.name == 'show_real_age')
      config.show_real_age = (val.value == "on");

    if (val.name == 'show_real_age_bg_color')
      config.show_real_age_bg_color = val.value;

    if (val.name == 'show_real_age_text_color')
      config.show_real_age_text_color = val.value;

    if (val.name == 'apply_aging')
      config.apply_aging = (val.value == "on");

    if (val.name == 'apply_aging_style')
      config.apply_aging_style = val.value;
  });
  return config;
}

function executeWithConfig(config){
  chrome.tabs.executeScript(config.tabid, {
    code: "start_effects_timer('"+ JSON.stringify(config) +"');"
  });
};
