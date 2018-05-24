chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if ((changeInfo.title != undefined) && (changeInfo.title.includes('| Trello'))) {
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
  config = {};
  if (options.length == 0) {
    config.show_age = true;
    config.apply_aging = true;
    return config;
  }

  opt = {};
  $.each(options, function(idx, val){
    opt[val.name] = val.value;
  });
  config.show_age = opt['show_age'] == 'on';
  config.show_real_age = opt['show_real_age'] == 'on';
  config.apply_aging = opt['apply_aging'] == 'on';
  config.show_age_bg_color = opt['show_age_bg_color'];
  config.show_age_text_color = opt['show_age_text_color'];
  config.show_real_age_bg_color = opt['show_real_age_bg_color'];
  config.show_real_age_text_color = opt['show_real_age_text_color'];
  config.apply_aging_style = opt['apply_aging_style'];

  return config;
}

function executeWithConfig(config){
  chrome.tabs.executeScript(config.tabid, {
    code: "applyEffects('"+ JSON.stringify(config) +"');"
  });
};
