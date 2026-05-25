from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()
client = OpenAI()

class Request(BaseModel):
    prompt: str

@app.post("/rpg")
def rpg(req: Request):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Você é um mestre de RPG estilo D&D"},
            {"role": "user", "content": req.prompt}
        ]
    )

    return {"response": response.choices[0].message.content}