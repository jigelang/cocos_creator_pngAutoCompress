'use strict';

var child_process = require("child_process");
var os = require('os');

var list = [];
var progress = 0;

function onBuildFinish (options, callback) {
  var utils = require(Editor.url('packages://pngquant/utils/utils'));
  function startCompression(){
      if(utils.checkIsExistProject(options.dest)){
        list = utils.loadPngFiles();
        compressionPng();
      }else{
        callback();
      }

  }
  function compressionPng() {
    let beforeSize = 0;
    let afterSize = 0;
    Editor.success("pngquant start!")
    let index = 0;
    let platform = os.platform();
    let pngquant_path = Editor.url('packages://pngquant/tool/windows/pngquant.exe');
    if(platform =='win32'){
      pngquant_path = Editor.url('packages://pngquant/tool/windows/pngquant.exe');
    }else{
      pngquant_path = Editor.url('packages://pngquant/tool/mac/pngquant');
    }
    let cmd = pngquant_path + " --force 256 --ext .png";

    let item = list[index];
    let exe_cmd = cmd + ' ' + item.path;
    progress = 0;

    function exec() {
      child_process.exec(exe_cmd, { timeout: 3654321 }, function (error, stdout, stderr) {
        if (stderr) {
          Editor.error("pngquant error : " + stderr);
          callback();
        }
        if (index < list.length - 1) {
          beforeSize = beforeSize + item.before_size
          index++;
          item = list[index];
          exe_cmd = cmd + ' ' + item.path;
          progress = parseInt(index / list.length * 100);
          Editor.log('compress progress = ' + progress + '%');
          exec();
        } else {
          let templist = utils.loadPngFiles();
          let i = 0;
          function calcuSize() {
            if (i < templist.length - 1) {
              i++;
              let cur = templist[i];
              afterSize = afterSize + cur.before_size
              calcuSize();
            }
          }
          calcuSize();
          let rate = afterSize / beforeSize * 100
          Editor.success('pngquant finished! compressRate = ' + rate + '%'+'\npreSize = ' + beforeSize + 'B\ncurSize = ' + afterSize+'B');
          callback();
          progress = 100;
        }
      })
    }
    exec();
  }
  startCompression();
}

module.exports = {
  load () {
    // execute when package loaded
    Editor.Builder.on('build-finished', onBuildFinish);
  },

  unload () {
    // execute when package unloaded
    Editor.Builder.removeListener('build-finished', onBuildFinish);
  },

  // register your ipc messages here
  messages: {
    open() {
     
      Editor.Panel.open('pngquant');
    },
  },
};
