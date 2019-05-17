"use strict";

module.exports = {
    modify_prev_param: {
        ja: "前の項目を修正"
    },
    failed_to_capture_payment: {
        ja: "決済処理に失敗しました。"
    },
    change_payment_method: {
        ja: "お支払い方法を変更"
    },
    payment_failed: {
        ja: "購入が正常に完了しませんでした。"
    },
    line_pay: {
        ja: "LINE Pay"
    },
    credit_card: {
        ja: "クレジットカード"
    },
    pls_select_payment_method: {
        ja: "お支払い方法を選択してください。"
    },
    please_input_credit_card: {
        ja: "クレジットカードの情報をご入力ください。"
    },
    input_credit_card: {
        ja: "クレジットカードを入力"
    },
    remove: {
        ja: "削除",
        en: "Remove"
    },
    order_id: {
        ja: "注文番号",
        en: "Order Number"
    },
    failed_to_capture_payment: {
        ja: "お支払いを正しく完了できませんでした。",
        en: "We couldn't complete payment correctly."
    },
    your_order_is_ready: {
        ja: (options) => {
            return `ご注文のお料理がご用意できました。${options.restaurant}のカウンターまでお越しください。`
        },
        en: (options) => {
            return `Your order is ready. Please come to ${options.restaurant} and pick it up.`
        }
    },
    pls_select_restaurant: {
        ja: `レストランを選択してください。`,
        en: `Please select restaurant.`
    },
    follow_message: {
        ja: `ご注文いただくにはまずレストランを選択してください。`,
        en: `Welcome to our food court. Please select the menu from the panel below.`
    },
    may_i_have_your_order: {
        ja: `ご注文をおうかがいします。`,
        en: `May I have you order?`
    },
    pls_select_order: {
        ja: `ご注文の品をお選びください。`,
        en: `Please select your order.`
    },
    unit: {
        ja: `個`,
        en: ``
    },
    yen: {
        ja: `円`,
        en: ` yen`
    },
    anything_else: {
        ja: `他にご注文はございますか？`,
        en: `Anything else?`
    },
    receipt: {
        ja: `領収書`,
        en: `Receipt`
    },
    food_fee: {
        ja: `飲食費`,
        en: `Food/Drink fee`
    },
    total_amount: {
        ja: `合計`,
        en: `Total amount`
    },
    amount: {
        ja: `金額`,
        en: `Price`
    },
    is_the_order_correct: {
        ja: `ご注文はこちらの内容でよろしいでしょうか？`,
        en: `Here is your order. Is it OK?`
    },
    check: {
        ja: `会計`,
        en: `Check`
    },
    add: {
        ja: `追加`,
        en: `Add`,
    },
    modify: {
        ja: `訂正`,
        en: `Modify`
    },
    no: {
        ja: `いいえ`,
        en: `No`
    },
    yes: {
        ja: `はい`,
        en: `Yes`
    },
    thats_it: {
        ja: `以上`,
        en: `That's it`
    },
    there_is_no_order: {
        ja: `現在承っている注文はないようです。`,
        en: `There is no on going order.`
    },
    do_you_add_order: {
        ja: `注文を追加されますか？`,
        en: `Would you order something?`
    },
    certainly: {
        ja: `承知しました。`,
        en: `Certainly.`
    },
    pls_select_order_to_cancel: {
        ja: `キャンセルする注文を選択してください。`,
        en: `Please select the order to cancel.`
    },
    quit_order: {
        ja: `今回のご注文を中止いたしました。`,
        en: `Order has been quit.`
    },
    quit: {
        ja: "中止",
        en: "Quit"
    },
    cancel: {
        ja: `キャンセル`,
        en: `Cancel`
    },
    pls_tell_me_quantity_of_the_item: {
        ja: (options) => {
            return `${options.label}の数量を教えていただけますか？`
        },
        en: (options) => {
            return `How many ${options.label} do you order?`
        }
    },
    the_item_has_been_removed: {
        ja: (options) => {
            return `${options.item_label}を削除しました。`
        },
        en: (options) => {
            return `${options.item_label} has been removed.`
        }
    },
    pls_go_to_payment: {
        ja: `ありがとうございます、こちらからお支払いにお進みください。`,
        en: `Thank you. Please go ahead to the payment.`
    },
    let_you_know_when_food_is_ready: {
        ja: `お品物がご準備できましたらご連絡しますのでそれまでお席でお待ちください。`,
        en: `I will send message when your order becomes ready.`
    },
    pay_x_yen: {
        ja: (options) => {
            return `${options.amount}円を支払う`;
        },
        en: (options) => {
            return `Pay ${String(options.amount)} yen`;
        }
    },
    more_than_x_unit: {
        ja: (options) => {
            return `${String(options.number)}個以上`;
        },
        en: (options) => {
            return `More than ${String(options.number)}`;
        }
    },
    more_than_x_item: {
        ja: (options) => {
            return `${options.item_label}を${String(options.number)}個以上`
        },
        en: (options) => {
            return `More than ${String(options.number)} ${options.item_label}`
        }
    },
    x_item: {
        ja: (options) => {
            return `${options.item_label}を${String(options.number)}個`
        },
        en: (options) => {
            return `${String(options.number)} ${options.item_label}`
        }
    },
    got_x_item: {
        ja: (options) => {
            return `${options.item_label}を${String(options.number)}個ですね。`
        },
        en: (options) => {
            return `Certainly, ${String(options.number)} ${options.item_label}.`
        }
    },
    no_idea_about_the_message_from_x: {
        ja: (options) => {
            return `${options.sender_name}から受信した以下のメッセージがわかりませんでした。`
        },
        en: (options) => {
            return `I have no idea about the following message from ${options.sender_name}.`
        }
    },
    answer: {
        ja: `回答する`,
        en: `Answer`
    },
    answer_pls: {
        ja: `回答をお願いします。`,
        en: `Answer please.`
    },
    do_you_want_chatbot_learn_this_question: {
        ja: `ChatbotにこのQ&Aを学習させますか？`,
        en: `Do you want Chatbot to learn this Q&A?`
    },
    chatbot_completed_learning: {
        ja: `学習が完了しました。`,
        en: `Chatbot learned this Q&A.`
    },
    i_will_reply_to_user_with_your_answer: {
        ja: `いただいた回答をユーザーに送信しておきます。`,
        en: `I will reply to the user with your answer.`
    }
}
