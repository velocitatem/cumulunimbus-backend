import streamlit as st
import random
import requests

class Valve:
	def __init__(self, state):
		self.state = state

	def __str__(self):
		return f"Valve open: {self.state}"

def toggleValve(v):
	print("togling")


st.write("Welcome to the IOT valve controller")

valves = []

def toggleValve(v):
	requests.post(f"https://c3b9-2a0c-5a82-e40d-5700-30c8-d84b-b5b9-608a.ngrok-free.app/open/{v}", json={"valve_id" : v})

for x in range(3):
	valves.append(Valve(False))
	valves[-1].state = st.toggle(f"VALVE {x}", key=f"valve_{x}", on_change=toggleValve(x))
