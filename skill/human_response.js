"use strict";

const debug = require("debug")("bot-express:skill");
const dialogflow = require("../service/dialogflow.js");

module.exports = class SkillHumanResponse {

    constructor(){
        this.clear_context_on_finish = true;

        this.required_parameter = {
            user: {},
            question: {},
            answer: {
                message_to_confirm: async (bot, event, context) => {
                    let message = {
                        type: "text",
                        text: await bot.t(`answer_pls`)
                    }
                    return message;
                },
                parser: {
                    type: "string"
                }
            },
            enable_learning: {
                message_to_confirm: async (bot, event, context) => {
                    let message = await bot.m.multi_button({
                        message_text: await bot.t(`do_you_want_chatbot_learn_this_question`),
                        action_list: [
                            {type:"message", label: `いいえ`, text: `いいえ`},
                            {type:"message", label: `はい`, text: `はい`}
                        ]
                    });
                    return message;
                },
                parser: {
                    type: "list",
                    policy: {
                        list: [`はい`, `いいえ`]
                    }
                },
                reaction: async (error, value, bot, event, context) => {
                    if (error) return;

                    if (value === `いいえ`){
                        return;
                    }

                    // Create new intent using question and add response using answer.
                    await dialogflow.add_intent({
                        name: context.confirmed.question,
                        training_phrase: context.confirmed.question,
                        action: "robot-response",
                        text_response: context.confirmed.answer
                    })

                    bot.queue({
                        type: "text",
                        text: await bot.t(`chatbot_completed_learning`)
                    });
                }
            }
        }
    }

    async finish(bot, event, context){
        // Promise List.
        let tasks = [];

        // -> Reply to administrator.
        tasks.push(bot.reply({
            type: "text",
            text: await bot.t(`i_will_reply_to_user_with_your_answer`)
        }));

        // -> Reply to original user.
        let message_text;
        if (context.confirmed.user.language != bot.language && bot.translator){
            message_text = await bot.translator.translate(context.confirmed.answer, context.confirmed.user.language);
        } else {
            message_text = context.confirmed.answer;
        }
        tasks.push(bot.send(context.confirmed.user.id, {
            type: "text",
            text: message_text
        }));

        await Promise.all(tasks);
    }
};
