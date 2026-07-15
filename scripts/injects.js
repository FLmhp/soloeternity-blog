hexo.extend.injector.register('head_begin', '<link rel="stylesheet" href="https://fastly.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/css/all.min.css">');

hexo.extend.injector.register('head_end', '<script>if(!localStorage.getItem("waifu-display")){localStorage.setItem("waifu-display",Date.now())}if(!localStorage.getItem("live2d-default-icegirl")){localStorage.setItem("modelId","0");localStorage.setItem("modelTexturesId","0");localStorage.setItem("live2d-default-icegirl","1")}window.addEventListener("load",function(){var s=document.createElement("script");s.src="/live2d-widget/dist/autoload.js";document.head.appendChild(s)},{once:true})</script>');

hexo.extend.injector.register("body_begin", '<div id="web_bg"></div>');

hexo.extend.injector.register('body_begin', `
<div id="loader-container"> 
    <div id="loader" class="loader"></div>
    <div class="loader-inner">
        <div class="loader-line-wrap">
            <div class="loader-line"></div>
        </div>
        <div class="loader-line-wrap">
            <div class="loader-line"></div>
        </div>
        <div class="loader-line-wrap">
            <div class="loader-line"></div>
        </div>
        <div class="loader-line-wrap">
            <div class="loader-line"></div>
        </div>
        <div class="loader-line-wrap">
            <div class="loader-line"></div>
        </div>
    </div>
</div>`, 'home');

// hexo.extend.filter.register('theme_inject', function(injects) {
//   injects.bodyBegin.file('loader', 'source/html/loader.html');
// });

hexo.extend.injector.register('body_end', '<script src="/js/sakura.js"></script>', 'home');

hexo.extend.injector.register("body_end",'<script src="/js/backgroundize.js"></script>');

hexo.extend.injector.register('body_end','<script src="/js/svg-neon.js?v=2"></script>');
