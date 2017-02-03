var debugging = true;

function log(text){
  if (debugging)
    console.log(text);
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {    

    if ((changeInfo.title != undefined) && (changeInfo.title.includes('|'))) {
      log('Tab updated');
      log(tab);
      executed = true;
      restore_options_and_execute(tab.id, changeInfo.title);
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.create({
          url: chrome.extension.getURL('options.html'),
          active: false
      }, function(tabe) {
          chrome.windows.create({
              tabId: tabe.id,
              type: 'panel',
              focused: true,
              width: 300,
              height: 350
          });
      });
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

function restore_options_and_execute(tabid, title) {
  log('Restoring options');
  chrome.storage.local.get({
    formOptions: []
  }, function(storage) {
    log('Restored options:');
    log(storage.formOptions);

    config = parse_config(storage.formOptions);
    execute_with_config(config, title, tabid);
  });
}

function parse_config(options){
  config = {
    show_age: false,
    show_age_bg_color: '#cccccc',
    show_age_text_color: '#000000',
    apply_aging: false,
    apply_aging_style: 'pirate'
  };

  log('Parsing configs');
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

function execute_with_config(config, title, tabid){
  config.title = title;
  config.tabid = tabid;

  log('Executing in Title['+ title +'] TabId['+ tabid +'] with config:');
  log(config);

  chrome.tabs.executeScript(tabid, {
    code: "start_effects_timer('"+ JSON.stringify(config) +"');"
  });
};

// chrome.tabs.onActivated.addListener(
//   function (tabId, changeInfo, tab){
//     log('Activated tab:');
//     log(tabId);
//     restore_options();
//   });

//document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click', save_options);





// chrome.runtime.onMessage.addListener(function(request) {
//     if (request.type === 'toggle_age') {
//         chrome.tabs.create({
//             url: chrome.extension.getURL('dialog.html'),
//             active: false
//         }, function(tab) {
//             // After the tab has been created, open a window to inject the tab
//             chrome.windows.create({
//                 tabId: tab.id,
//                 type: 'popup',
//                 focused: true
//                 // incognito, top, left, ...
//             });
//         });
//     }
// });
