"use strict";

const rename = num => {
  return num > 99 ? num : num > 9 ? '0' + num : '00' + num;
}

const request = url => {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      if (this.status !== 200) {
        throw new Error(this.response);
      }

      const div = document.createElement('div');
      div.innerHTML = this.response;
      resolve(div);
    };
    xhr.send();
  });
}

new Vue({
  el: '#main',
  data: {
    imgList: [],
    imgElementList: [],
    url: 'https://tieba.baidu.com/p/5027692610?see_lz=1',
    buttonDisabled: false,
    anlaysing: false,
    showDownloadButton: false
  },
  methods: {
    async analysURL() {
      const postURL = this.url.trim();
      const htmlElement = await request(postURL);

      Object.assign(this, {
        url: '',
        anlaysing: true,
        showDownloadButton: false
      });

      this.imgList = Array.prototype.slice.call(
        htmlElement.querySelectorAll('img.BDE_Image')
      ).filter(dom => {
        return /^https\:\/\/imgsa\.baidu\.com\/forum\/.+$/.test(dom.src);
      }).map((dom, i) => {
        return dom.src.replace(/^.+\/sign.+\/(.+)+$/, '$1'); // img ID
      });

      Object.assign(this, {
        anlaysing: false,
        showDownloadButton: true
      });
    },

    async downloadImage() {
      let elementList = [];
      elementList = this.imgList.map((fileName, i) => {
        return 'http://imgsrc.baidu.com/forum/pic/item/' + fileName;
      });

      this.imgElementList = elementList;
    },

    handleImageLoaded(e, i) {
      const fileName = rename(i);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.height = e.currentTarget.height;
      canvas.width = e.currentTarget.width;
      ctx.drawImage(e.currentTarget, 0, 0);

      canvas.toBlob(blob => {
        var a = document.createElement('a');
        a.download = fileName + '.jpg';
        a.href = window.URL.createObjectURL(blob);
        a.click();
        window.URL.revokeObjectURL(a.href);
      }, 'image/jpeg', 1);
    }
  }
});