import { Bot } from "./bot/bot";
import { createInterface } from "readline";
async function init() {
    const bot = new Bot();
    bot.startup();
    let rl  = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Input channel Category Id: ", async function(id:string){
        let cate = await bot.getChannelCategory(id);
        if(cate.name){
            cate.children.cache.each(channel=>{
                channel.delete();
            })
            cate.delete();
            console.log("Category deleted");
        }
        else{
            console.log("Category not found");
        }
    })
    bot.stop();
}
init();