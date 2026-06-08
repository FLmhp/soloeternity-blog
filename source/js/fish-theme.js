(function() {
    // 鱼类背景颜色定义
    const FISH_COLORS = {
        light: '#51c4d3',
        dark: '#181c27'
    };

    // 获取当前主题模式
    function getCurrentTheme() {
        var currentTheme = document.documentElement.getAttribute('data-user-color-scheme');
        if (!currentTheme) {
            currentTheme = document.documentElement.getAttribute('data-default-color-scheme');
        }
        if (!currentTheme) {
            // 如果没有设置主题，则根据 prefers-color-scheme 判断
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                currentTheme = 'dark';
            } else {
                currentTheme = 'light';
            }
        }
        return currentTheme;
    }

    // 更新鱼类背景颜色
    function updateFishBackgroundColor() {
        const renderer = window.RENDERER;
        if (renderer && renderer.context) {
            // 重新渲染时会使用新的颜色
            renderer.context.fillStyle = FISH_COLORS[getCurrentTheme()] || FISH_COLORS.light;
        }
    }

    // 监听主题变化
    function watchThemeChange() {
        // 监听属性变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'data-user-color-scheme' || 
                     mutation.attributeName === 'data-default-color-scheme')) {
                    updateFishBackgroundColor();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-user-color-scheme', 'data-default-color-scheme']
        });

        // 同时监听媒体查询变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateFishBackgroundColor);
        }
    }

    // 初始化
    function init() {
        // 等待页面和鱼类渲染器加载完成
        if (typeof RENDERER !== 'undefined' && RENDERER.context) {
            updateFishBackgroundColor();
            watchThemeChange();
        } else {
            // 如果 RENDERER 还未加载，等待一段时间后重试
            setTimeout(init, 100);
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();