function webRotate360() {
    jQuery(document).ready(() => {
        function getConfigURL() {
            let configURL = null;
            jQuery('.productView-nav img').each(function () {
                const altText = jQuery(this).attr('alt');
                if (altText && altText.startsWith('http')) {
                    configURL = altText;
                }
            });
            return configURL;
        }

        const configURL = getConfigURL();
        if (configURL) {
            const isMobileView = jQuery('.productView-nav-mobile').is(':visible');
            const carouselContainerClass = isMobileView ? '.productView-nav-mobile' : '.productView-nav-desktop';
            const mainSliderSelector = `${carouselContainerClass}.slick-initialized.slick-slider`;

            let attempts = 0;
            const intervalIdMain = setInterval(() => {
                const $mainSlider = jQuery(mainSliderSelector);
                if ($mainSlider.length === 1) {
                    clearInterval(intervalIdMain);
                    const mainSlide = `<figure class="productView-image slick-slide"><div class="productView-img-container"><iframe src="${configURL}" style="border: 0;width: 100%;height: 100%;position: absolute;left: 0;right: 0;margin: 0 auto 0 auto;" title="3D Product View" allowfullscreen></iframe></div></figure>`;
                    $mainSlider.slick('slickAdd', mainSlide, 0, true);
                } else if (attempts++ > 50) { // Stop after 50 attempts (5 seconds)
                    clearInterval(intervalIdMain);
                }
            }, 100);
        }
    });
}
webRotate360();
