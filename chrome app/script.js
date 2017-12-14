const postUrl = document.getElementById('post-url');
const btnAnalys = document.getElementById('btn-analys');
const textResult = document.getElementById('text-result');
const imgWrap = document.getElementById('img-wrap');
const btnDownload = document.getElementById('btn-download');

const Store = {
  imgList: []
}

// 重命名
const rename = function(num) {
  return num > 99 ? num : num > 9 ? '0' + num : '00' + num;
}

// 识别图片html
const analys = function(htmlDOM) {
  Store.imgList = Array.prototype.slice.call(
    htmlDOM.querySelectorAll('img.BDE_Image')
  ).filter(function(dom) {
    return /^https\:\/\/imgsa\.baidu\.com\/forum\/.+$/.test(dom.src);
  }).map(function(dom, i) {
    return dom.src.replace(/^.+\/sign.+\/(.+)+$/, '$1'); // img ID
  });

  textResult.innerHTML = '结果：' + Store.imgList.length + '张图片';
  textResult.removeAttribute('style');
  btnDownload.removeAttribute('style');
}

const request = function(url) {
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

const getImageOnloadHandler = function(fileName) {
  return function(e) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);

    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.download = fileName;
      a.href = window.URL.createObjectURL(blob);
      a.click();
      window.URL.revokeObjectURL(a.href);
    }, 'image/jpeg', 1);
  }
}

btnAnalys.addEventListener('click', async function(e) {
  const url = postUrl.value.trim();
  postUrl.value = '';
  btnAnalys.setAttribute('disabled', 'disable');

  const htmlDOM = await request(url);
  analys(htmlDOM);
  return true;
});

btnDownload.addEventListener('click', function() {
  Store.imgList.forEach(function(fileName, i) {
    const img = new Image();
    img.src = 'http://imgsrc.baidu.com/forum/pic/item/' + fileName;
    img.setAttribute('style', 'position:absolute;visibility:hidden;');
    img.onload = getImageOnloadHandler(rename(i));
    imgWrap.appendChild(img);
  });
});