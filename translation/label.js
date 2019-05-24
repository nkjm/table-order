"use strict";

module.exports = {
    sorry_we_have_no_recommendation_for_you: {
        ja: `申し訳ありません、ご要望に合うお料理がございませんでした。`,
        en: `We're sorry but we do not have suitable proposal for you.`
    },
    order_x: {
        ja: (options) => {
            return `${options.item_label}を注文`
        },
        en: (options) => {
            return `Order ${options.item_label}`
        }
    },
    our_recommendation_is_x: {
        ja: (options) => {
            return `お薦めは${options.item_label}です。`
        },
        en: (options) => {
            return `Then our recommendation is ${options.item_label}.`
        }
    },
    which_ingredients_do_you_like: {
        ja: "お野菜、お肉でお好みはございますか？",
        en: "Which do you like vegetables or meats?"
    },
    vegetable: {
        ja: "野菜",
        en: "Vegetables"
    },
    chicken: {
        ja: "鶏肉",
        en: "Chicken"
    },
    pork: {
        ja: "豚肉",
        en: "Pork"
    },
    beef: {
        ja: "牛肉",
        en: "Beef"
    },
    seafood: {
        ja: "魚介",
        en: "Sea food"
    },
    no_answer_for_a_while_so_we_quit_this_order_for_now: {
        ja: `しばらく時間が経ちましたので、一旦オーダーは中止しておきますね。`,
        en: `We quit this order for now.`
    },
    i_have_no_idea_how_hot_x_is: {
        ja: (options) => {
            return `${options.item_label}がどれだけ辛いか？それはちょっとわかりませんねー。`
        },
        en: (options) => {
            return `I have no idea how hot ${options.item_label} is.`
        }
    },
    x_is_not_hot_at_all: {
        ja: (options) => {
            return `${options.item_label}は全然辛くないです。`
        },
        en: (options) => {
            return `${options.item_label} is not hot at all. Recommended for kids, too.`
        }
    },
    x_is_moderately_hot: {
        ja: (options) => {
            return `${options.item_label}はそこそこ辛いです。`
        },
        en: (options) => {
            return `${options.item_label} is hot but no so much. It's standard in Thai Food.`
        }
    },
    x_is_extremely_hot: {
        ja: (options) => {
            return `${options.item_label}は激しく辛いです。`
        },
        en: (options) => {
            return `${options.item_label} is extremely hot but I'm sure you love it.`
        }
    },
    x_not_found_in_menu: {
        ja: (options) => {
            return `${options.item_label}はメニューにないようです。`
        },
        en: (options) => {
            return `${options.item_label} not found in menu.`
        }
    },
    conversation_discarded: {
        ja: "リクエストは中止されました。",
        en: "Request has been discarded."
    },
    modify_prev_param: {
        ja: "前の項目を修正",
        en: "Modify prev"
    },
    failed_to_capture_payment: {
        ja: "決済処理に失敗しました。",
        en: "Failed to capture payment",
    },
    change_payment_method: {
        ja: "お支払い方法を変更",
        en: "Change payment method"
    },
    payment_failed: {
        ja: "購入が正常に完了しませんでした。",
        en: "Payment failed."
    },
    line_pay: {
        ja: "LINE Pay",
        en: "LINE Pay" 
    },
    credit_card: {
        ja: "クレジットカード",
        en: "Credit Card"
    },
    pls_select_payment_method: {
        ja: "お支払い方法を選択してください。",
        en: "Please select payment method."
    },
    pls_pay_by_line_pay: {
        ja: "LINE Payでお支払いください。",
        en: "Please pay by LINE Pay."
    },
    please_input_credit_card: {
        ja: "クレジットカードの情報をご入力ください。",
        en: "Please enter your credit card."
    },
    input_credit_card: {
        ja: "クレジットカードを入力",
        en: "Enter credit card"
    },
    remove: {
        ja: "削除",
        en: "Remove"
    },
    reference_number: {
        ja: "注文番号",
        en: "Order Number"
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
        ja: `ご注文のお料理がご用意できました。カウンターまでお越しください。`,
        en: `Your order is ready. Please come and pick it up.`
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
        en: `What would you like to order?`
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
    quantity: {
        ja: `数量`,
        en: `Quantity`
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
