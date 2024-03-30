function webRotate360() {
    jQuery(document).ready(() => {
        function getConfigURL() {
            let configURL = null;
            let WR360_PLACEHOLDER = '.productView-images, .productView-image';
            // Thumbnail Slick slider
            jQuery(WR360_PLACEHOLDER).each(function replaceImages() {
                const altText = jQuery(this).attr('alt');
                if (altText && altText.length > 4) {
                    if (altText.indexOf('http') === 0) {
                        configURL = altText;
                    }
                }
            });
            return configURL;
        }
        function getQueryParamByName(name) {
            const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        }
        const configURL = getConfigURL();
        if (configURL) {
            // Set Container Targets
            const containerClass = jQuery('.productView-images').is(':visible') ? '.productView-nav-mobile' : '.productView-nav-pc';
            const intervalIdMain = setInterval(() => {
                // Get Slider
                const $mainSlider = jQuery(`${containerClass}.is-visible`);
                if ($mainSlider.length === 1 /* && $mainSlider.is(':visible') */) {
                    clearInterval(intervalIdMain);
                    const mainSlide = `<figure class="productView-images"><div class="productView-img-container"><iframe src="${configURL}" style="border: 0;width: 100%;height: 100%;position: absolute;left: 0;right: 0;margin: 0 auto 0 auto;" title="3D Product View" allowfullscreen></iframe></div></figure>`;
                    $mainSlider.slick('slickAdd', mainSlide, 0, true);
                }
            }, 100);
            // Jordan Removed 3-10-2022 so that thumbnail does not cause an additional image to push the carousel to 2 lines
            // const intervalIdThumbs = setInterval(() => {
            //     const $thumbsSlider = jQuery('.productView-thumbnails.slick-initialized.slick-slider');
            //     if ($thumbsSlider.length === 1) {
            //         clearInterval(intervalIdThumbs);
            //         const thumbSlide = '<div class="slick-slide"><div><img class="responsive-img img-fluid border rounded-5 w-100" src="https://images.rhinorails.com/w_91/https://cdn11.bigcommerce.com/s-k895mwcui9/content/custom/360icon.svg"/></div></div>';
            //         $thumbsSlider.slick('slickAdd', thumbSlide, 0, true);
            //     }
            // }, 100);
        }
    });
}
webRotate360();
