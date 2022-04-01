
const actions = require('../../constants/customAction');
const sleep = require('./sleep')

const logger = require('../logger')

const customActionHandler = async (page, customActions) => {

    if (customActions && Object.keys(customActions).length > 0) {
        for (let i = 0; i < customActions.length; i++) {
            let action = customActions[i]
            try {
                await sleep(action.delayBeforeAction)
                let selector = action.element
                switch(action.type){
                                            
                    case actions.WAIT_FOR:
                        await page.waitForSelector(action.element, {visible: true})
                        .then( () => {
                            logger.log(`Waiting for ${selector}`)
                        })
                        break;

                    case actions.CLICK:
                        let elem =  await page.waitForSelector(action.element)

                        await elem.click().then( () => {
                            logger.info(`Clicked element ${selector}`)
                        })
                    
                    case actions.CLICK_NAVIGATE:
                        await page.evaluate( (action) => {
                            let element = document.querySelector(action.element)
                            if (element) {
                                element.click()
                            }
                        }, action)
                            .then( () => {
                                logger.info(`Clicked element ${selector} and navigated`)
                            })

                        break;
                    
                    case actions.HOVER:
                        await page.hover(action.element).catch((err) => {
                        })
                        break;
                    case actions.TYPE:
                        await page.type(action.element, action.value, {delay: 120})
                            .then(() => {
                                logger.info(`Type the value ${action.value} on element ${action.element}`)
                            })
                            .catch((err) => {
                                logger.error(`Failed to type on element ${action.element} due to: ${err}`)
                            })

                        break;

                    case actions.DECOMPOSE:
                        await page.evaluate((sel) => {
                            let elements = document.querySelectorAll(sel)
    
                            for(let i = 0; i < elements.length; i++) {
                                elements[i].parentNode.removeChild(elements[i])
                            }
    
                        }, selector)
                        break;
                    
                    case actions.REMOVE_CLASS:
                        let classToRemove = action.class
                        await page.evaluate((selector, classToRemove) => {
                            let element = document.querySelector(selector)
                            element.classList.remove(classToRemove)
                        }, selector, classToRemove)
                        break;

                    case actions.MOUSE_MOVE:
                        await page.mouse.move(action.x, action.y)
                        break;
                    
                    case actions.SCROLL_IMAGES:
                        await page.evaluate(async () => {
                            // Scroll down to bottom of page to activate lazy loading images
                            document.body.scrollIntoView(false)
    
                            // Wait for all remaining lazy loading images to load
                            await Promise.all(Array.from(document.getElementsByTagName('img'), image => {
                                if (image.complete) {
                                    return
                                }
    
                                return new Promise((resolve, reject) => {
                                    image.addEventListener('load', resolve)
                                    image.addEventListener('error', reject)
                                })
                            }))
                        })
                        break;
                    
                    case actions.CLICK_IFRAME:
                        await page.waitForSelector(selector)
                        const elementHandle = await page.$(selector)
                        const frame = await elementHandle.contentFrame()
    
                        for (let i = 0; i < action.buttons.length; i++) {
                            let buttonSelector = action.buttons[i]
                            await frame.waitForSelector(buttonSelector)
                            const button = await frame.$(buttonSelector)
                            await page.waitFor(action.delayBeforeAction)
                            await button.click()
                            await page.waitFor(action.delayAfterAction)
                        }
                        break;
                    

                    // case actions.DELAY:
                    //     sleep(Number(action.value))
                    //     break;
                
                }        

                await sleep(action.delayAfterAction)
            } catch(ex) {
                logger.error(`Unable to perform ${action.type} due to ${ex}`)
            } // Do Nothing
        }
    }
}

module.exports = customActionHandler;