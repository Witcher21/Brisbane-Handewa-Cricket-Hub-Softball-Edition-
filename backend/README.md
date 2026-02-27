# Brisbane Handewa Cricket Hub — Backend

## Setup & Run

```bash
# 1. Create virtual environment
python -m venv env

# 2. Activate it
# Windows:
env\Scripts\activate
# Mac/Linux:
source env/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the API server
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Path                     | Description                           |
| ------ | ------------------------ | ------------------------------------- |
| GET    | `/`                      | API info                              |
| GET    | `/api/matches`           | All matches list                      |
| GET    | `/api/matches/{id}/live` | Live match state                      |
| POST   | `/api/delivery`          | Submit a ball + broadcast via WS      |
| GET    | `/api/players`           | All player profiles                   |
| GET    | `/api/teams`             | All teams + standings                 |
| WS     | `/ws/live/{match_id}`    | WebSocket — real-time live score feed |

## WebSocket Usage (JS)

```js
const ws = new WebSocket('ws://localhost:8000/ws/live/1')
ws.onmessage = (event) => {
  const payload = JSON.parse(event.data)
  console.log(payload.type, payload.data)
}
```
