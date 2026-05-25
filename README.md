# Malevich — Журнал работ на строительном объекте

## Стек

**Фронтенд:** React 18 + TypeScript + Vite, TanStack Query v5, Tailwind CSS v3

**Бэкенд:** Python 3.11 + FastAPI, SQLAlchemy 2.0

**База данных:** PostgreSQL 15

**Инфраструктура:** Docker + Docker Compose

## Функциональность

- Список записей журнала: дата, вид работ, объём с единицей измерения, ФИО исполнителя
- Сортировка по дате и фильтрация по диапазону дат
- Добавление и редактирование записей с валидацией обязательных полей
- Удаление записи с подтверждением
- Справочник видов работ — выбор из предзаполненного списка в БД

## Требования

- [Docker CE](https://docs.docker.com/engine/install/) 20.10+ (не Podman)
- Docker Compose v2 (входит в Docker CE)

## Запуск

```bash
git clone https://github.com/AgataNovak/Malevich_Journal.git
cd Malevich_Journal
docker compose up --build
```

Приложение: **http://localhost:3000**  
Swagger API: **http://localhost:8000/docs**
