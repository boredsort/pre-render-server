
require('dotenv').config()
const fs = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const {v5: uuidv5} = require('uuid')


const customActionsHandler = require('./pageActions/customActions')
const autoScroll = require('./pageActions/autoScroll')
const logger = require('./logger')



const render = async (page, customActions={}, nextPage) => {

    // puppeteer.use(StealthPlugin())

    // const browser = await puppeteer.launch({headless:false});
    try {
       
        logger.info('Rendering')
        // const page = await browser.newPage();
    
        // await page.setRequestInterception(true);
    
        // page.on('request', (request) => {
        //     logger.info(`[ * ] - Request: ${request.method()} ${request.url()}` )
        //     request.continue();
        // });
    
        // page.on('response', (response) => {
        //     logger.info(`[ * ] - Response: ${response.status()} ${response.url()}` )
        // });
    
        // browser.on('disconnected', async () => {
        //     try {
    
        //         if(browser) {
        //             await browser.close()
        //             logger.info('Browser is closed and disconnected')
        //         } 
        //     }
        //     catch(err) {
        //         logger.error("Failed to close the browser")
        //     }
    
        // })
    


        await page.setViewport({
            width: 1920,
            height: 1080
        });
    
        await customActionsHandler(page, customActions)
    
        await autoScroll(page);
    
        // await page.screenshot({path:'./test.png', fullPage: true}).then(
        //     () => { logger.info('Webpage screen capture success')}
        // ).catch( (err) => {
        //     logger.error(`Failed to capture screen due to: ${err}`)
        // });


        const html = await page.content().then( (res) => {
            logger.info('Html source exctraction success')
            return res
        }).catch( (err) => {
            logger.error(`Failed to extract HTML source due to: ${err}`)
        });
    

        const hasNext = await page.$(nextPage)
        // const { nano } = await connector().then( (res) => {
        //     logger.info('Establish database connection')
        //     return res
        // }).catch( (err) => {
        //     logger.error('Failed to connect the DB')
        //     // should terminate the server
        //     throw(err)
        // })

        // logger.info(util.inspect(nano.db, {showHidden: false, depth: null, colors: true}))

        return {html:html, hasNext: !!hasNext}

    //     const uuid = utils.urlto_uuid(url);
    //     const id = `${utils.today()}@${uuid}`;
    //     const item = {
    //         "_id": id,
    //         "source_url": url,
    //         "createdAt": new Date().toISOString(),
    //         "html": String(html),
    //         "uuid": uuid

    //     }
    
    //     const response = await nano.insert(item).then( (res) => {
    //         logger.info('Cached the url successfully.')
    //         return res
    //     }).catch( (err) => {
    //         logger.error(`Failed to cache the URL an error occured: ${err}`)
    //     });

    //     fs.writeFileSync("./file.txt", String(html));
        
    //     return result = { 
    //         'success': !!response,
    //         'cache_id': response?id:''
    //     }
    } 
    catch(er){
        logger.error(er)
    }
    
    // finally {
    //     browser.close()
    // }

}

const execute = async (url, customActions={}, {nextPageElement, maxStep}) => {


    puppeteer.use(StealthPlugin())

    const browser = await puppeteer.launch({headless:false});

    const page = await browser.newPage();
        
    browser.on('disconnected', async () => {
        try {

            if(browser) {
                await browser.close()
                logger.info('Browser is closed and disconnected')
            } 
        }
        catch(err) {
            logger.error("Failed to close the browser")
        }

    })

    await page.goto(url, {waitUntil:'networkidle2'}).then(
        () => {logger.info(`Connected to url ${url}`)}
    ). catch( (err) => {
        logger.error(`Failed to connect due to: ${err}`)
    });

    // await page.waitForNavigation({
    //     waitUntil: 'networkidle0',
    //   });

    try{
        let currentPage = 1
        let htmlPages = []
        do {
            logger.info(`current Page: ${currentPage}`)
            let {html, hasNext} = await render(page, customActions, nextPageElement)
    
            if(html) {
                let htmlpage = { page: currentPage, html}
                htmlPages.push(htmlpage)
            }
            
            logger.info(`has next? ${hasNext}`)
            if(hasNext){
                currentPage++; 
                const [response] = await Promise.all([
                    page.waitForNavigation(),
                    page.click(nextPageElement)
                ])
                
            }
            else{
                break;
            }
            logger.info("cur page", currentPage)
        }
        while(currentPage <= maxStep);

        return htmlPages
    }
    catch(er){
        logger.error(er)
    }
    
    finally {
        browser.close()
    }




}
const preRenderServer = {
    render: render,
    execute: execute
}

const tester = async () => {
    url = 'https://quotes.toscrape.com/page/9/'
    let nextPage = {
        nextPageElement:'nav li.next a',
        maxStep: 2
    }
    customActions = {}

    const results = await preRenderServer.execute(url, customActions, nextPage)

    console.log(results)
}

tester()
// function today(){
//    let date = new Date()
//    return date.toISOString().split('T')[0]
// }

// // action = [
// //             {"type": "wait-for", "element": "div.coi-banner__wrapper", "delayBeforeAction": 1000, "delayAfterAction": 1500},
// //             {"type": "click-navigate", "element": 'div.coi-banner__page-footer > button[aria-label="JEG GODTAR"]', "delayBeforeAction": 5000, "delayAfterAction": 1500}
// //         ]
// action = [
//     {"type": "wait_for", "element": "div.a-section.glow-toaster", "delayBeforeAction": 1000, "delayAfterAction": 1500},
//     // {"type": "click", "element": ".glow-toater-footer input.a-button-input", "delayBeforeAction": 1000, "delayAfterAction": 1000},
//     {"type": "click", "element": "#glow-ingress-block", "delayBeforeAction": 1000, "delayAfterAction": 3000},
//     {"type": "type", "element": "#GLUXZipInputSection input", "delayBeforeAction": 2000, "delayAfterAction": 1000, "value": "90001"},
//     {"type": "click", "element": "#GLUXZipUpdate input", "delayBeforeAction": 3000, "delayAfterAction": 3000},
//     // {"type": "click", "element": ".a-popover-footer button", "delayBeforeAction": 3000, "delayAfterAction": 3000},
//     {"type": "click_navigate", "element": ".a-modal-scroller.a-declarative", "delayBeforeAction": 1000, "delayAfterAction": 3000}
    
// ]
 
// url = 'https://www.amazon.com/international-shipping-video-games/b?ie=UTF8&node=16225016011'
// // url = 'https://www.elkjop.no/product/gaming/gaming-pc/barbar-gaming-pc/hp-omen-16-c0825no-16-barbar-gaming-pc/311300'
// // url = 'https://www.codegrepper.com/code-examples/whatever/puppeteer+scrolling+down'
// // url = 'https://www.amazon.com/'
// render(url, action)
module.exports = preRenderServer;
