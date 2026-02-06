import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from dotenv import load_dotenv
from database import Database

# Загружаем переменные окружения (токен бота лучше хранить в .env)
load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") # Добавь это в свой .env файл

# Инициализация
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
db = Database()

# Настройка логирования
logging.basicConfig(level=logging.INFO)

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(
        "Привет! Чтобы привязать свой аккаунт, введи команду:\n"
        "`/link ТВОЙ_ТОКЕН`",
        parse_mode="Markdown"
    )

@dp.message(Command("link"))
async def cmd_link(message: types.Message):
    # Извлекаем токен из сообщения "/link <token>"
    args = message.text.split()
    
    if len(args) < 2:
        await message.answer("Пожалуйста, введите токен. Пример: `/link abc123def`", parse_mode="Markdown")
        return

    token = args[1]
    tg_id = message.from_user.id

    # Пробуем привязать через метод в БД
    success = db.link_tg_user(token, tg_id)

    if success:
        await message.answer("✅ Успешно! Твой Telegram аккаунт привязан к профилю на сайте.")
    else:
        await message.answer("❌ Ошибка! Неверный токен или срок его действия истек.")

@dp.message(Command("balance"))
async def get_balance(message: types.Message):
    tg_id = message.from_user.id
    user = db.search_user_by_tg(tg_id)
    if user.get("status"):
        balance = db.get_current_balance(user.get("id"))
        await message.answer(f"Balance: {balance}")
    else:
        await message.answer("Ошибка!")
        

async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен")