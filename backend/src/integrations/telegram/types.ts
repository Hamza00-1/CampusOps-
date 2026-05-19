// Telegram Bot API — minimal type definitions
export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
}

export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    first_name?: string;
    username?: string;
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

export interface TelegramContext {
    chatId: string;
    userId: number;
    text: string;
    args: string[];
    username?: string;
    firstName?: string;
}
