const scrollDown = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

const scrollUp = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = document.body.scrollHeight;
            var distance = 100;
            var timer = setInterval(() => {
                window.scrollBy(0, -distance);
                totalHeight -= distance;

                if(totalHeight <= 0){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

const autoScroll = {
   scrollDown,
   scrollUp
}


module.exports = autoScroll;