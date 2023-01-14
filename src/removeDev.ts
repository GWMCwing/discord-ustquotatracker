import { Bot } from "./bot/bot";
import { createInterface } from "readline";
async function init() {
    const bot = new Bot();
    await bot.startup();
    let rl  = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Input channel Category Id: ", async function(id:string){
        let cate = await bot.getChannelCategory(id).catch((r)=>{
            console.log("Id missmatch");
            return null;
        })
        if(cate){
            cate.children.cache.each(channel=>{
                channel.delete();
            })
            console.log("Category deleted");
        }
        else{
            console.log("Category not found");
        }
    })
}
init();