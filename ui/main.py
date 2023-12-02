import streamlit as st
import random
import requests
from dotenv import load_dotenv
import time
import os

load_dotenv()


host = os.getenv("HOST")


class Valve:
    def __init__(self, state):
        self.state = state

    def __str__(self):
        return f"Valve open: {self.state}"

def toggleValve(v):
    print("togling")


st.write("Welcome to the IOT valve controller")

valves = {}

def toggleValve(v):
    # boolean state
    response = requests.post(f"{host}/open/{v}", json={"state" : valves[v].state})
    print(response.status_code)
    if response.status_code != 200:
        return
    # get actionId
    print(response.json())
    actionId = response.json()["actionId"]
    resCount = 10
    while resCount > 0:
        print("waiting for ack")
        res = requests.get(f"{host}/acknowledged/{actionId}")
        if res.status_code == 200:
            if res.json()["acknowledged"]:
                return True
        resCount -= 1
        time.sleep(1)


for x in ["MAM"]:
    valves[x]=(Valve(False))
    valves[x].state = st.toggle(f"VALVE {x}", key=f"valve_{x}", on_change=toggleValve(x))
