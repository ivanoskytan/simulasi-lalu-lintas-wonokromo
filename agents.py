from mesa import Agent
import math
import random

class VehicleAgent(Agent):
    def __init__(self, model, route, is_angkot=False):
        super().__init__(model)

        self.route = route
        self.target_index = 1

        self.x, self.y = route[0]

        self.speed = random.uniform(1.5, 2.2)

        self.is_angkot = is_angkot
        self.is_parking = False
        self.park_timer = 0

    def step(self):
        if self.target_index >= len(self.route):
            self.model.remove_agent(self)
            return
        
        if self.is_angkot:
            if (
                500 < self.y < 650
                and not self.is_parking
                and self.park_timer == 0
            ):
                if random.random() < self.model.angkot_probability:
                    self.is_parking = True
                    self.park_timer = random.randint(80, 200)
        
            if self.is_parking:
                self.park_timer -= 1
                if self.park_timer <= 0:
                    self.is_parking = False
            
            return
        
        tx, ty = self.route[self.target_index]

        dx = tx - self.x
        dy = ty - self.y

        dist = math.sqrt(dx**2 + dy**2)

        if dist > self.speed:
            self.x += dx/dist*self.speed
            self.y += dy/dist*self.speed
        else:
            self.target_index += 1
    
    def serialize(self):
        return {
            "x": self.x,
            "y": self.y,
            "isAngkot": self.is_angkot,
            "isParking": self.is_parking
        }
