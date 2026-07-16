const js = hexo.extend.helper.get('js').bind(hexo);

hexo.extend.filter.register('after_render:html', (html) => html.replace(
    /<img\b(?![^>]*\bloading=)[^>]*>/gi,
    (tag) => tag.replace('<img', '<img loading="lazy" decoding="async"')
));

hexo.extend.injector.register('head_begin', '<link rel="stylesheet" href="https://fastly.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" integrity="sha384-nRgPTkuX86pH8yjPJUAFuASXQSSl2/bBUiNV47vSYpKFxHJhbcrGnmlYpYJMeD7a" crossorigin="anonymous">');

hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/loader.css"><link rel="stylesheet" href="/css/scrollanimation.css">', 'home');

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

hexo.extend.injector.register('body_end', () => js([
    { src: '/js/loader.js', defer: true },
    { src: '/js/scrollanimation.js', defer: true },
    { src: '/js/hitokoto-cooldown.js', defer: true },
    { src: '/js/sakura.js', defer: true }
]), 'home');

hexo.extend.injector.register('body_end', `<script>(function(){
    if(!localStorage.getItem("live2d-auto-show")){
        localStorage.removeItem("waifu-display");
        localStorage.setItem("live2d-auto-show","1");
    }
    if(!localStorage.getItem("live2d-default-icegirl")){
        localStorage.setItem("modelId","0");
        localStorage.setItem("modelTexturesId","0");
        localStorage.setItem("live2d-default-icegirl","1");
    }
    window.addEventListener("load",function(){
        (window.requestIdleCallback||function(callback){return setTimeout(callback,1000)})(function(){
            function load(src,onload){
                var script=document.createElement("script");
                script.src=src;
                if(onload) script.onload=onload;
                document.head.appendChild(script);
            }
            load("/js/anime.min.js",function(){load("/js/fireworks.js")});
            ["/js/fishes.js","/js/stars.js","/js/typing-effect.js","/js/svg-neon.js?v=2"].forEach(function(src){load(src)});
            load("/js/aplayer-1.10.1.min.js",function(){load("/js/music-dock-v6.js?v=7")});
            load("/live2d-widget/dist/autoload.js");
        },{timeout:3000});
    },{once:true});
})();</script>`);

// hexo.extend.filter.register('theme_inject', function(injects) {
//   injects.bodyBegin.file('loader', 'source/html/loader.html');
// });

