NODES = {
    "TL1": {"x": 550, "y": 480, "type": "TL", "id": 1},
    "TL2": {"x": 600, "y": 400, "type": "TL", "id": 2},
    "TL3": {"x": 400, "y": 220, "type": "TL", "id": 3},
    "TL4": {"x": 410, "y": 310, "type": "TL", "id": 4},
    "TL5": {"x": 250, "y": 240, "type": "TL", "id": 5},
    "CrossA": {"x": 470, "y": 410, "type": "GATE", "id": "A"},
    "CrossB": {"x": 310, "y": 170, "type": "GATE", "id": "B"},
    "InStWono": {"x": 800, "y": 650, "type": "NODE"},
    "InDarmo": {"x": 850, "y": 380, "type": "NODE"},
    "InAhYani": {"x": 150, "y": -50, "type": "NODE"},
    "InSbyMlg": {"x": -50, "y": 260, "type": "NODE"},
    "OutSbyMlg": {"x": -50, "y": 430, "type": "NODE"},
    "OutAhYani": {"x": 50, "y": -50, "type": "NODE"},
    "OutStWono": {"x": 800, "y": 550, "type": "NODE"},
    "MidStWono": {"x": 420, "y": 350, "type": "NODE"},
}

ROUTES = [
    [NODES["InStWono"], NODES["TL1"], NODES["CrossA"], NODES["OutSbyMlg"]],
    [NODES["InStWono"], NODES["TL1"], NODES["CrossA"], NODES["TL4"], NODES["CrossB"], NODES["OutAhYani"]],
    [NODES["InDarmo"], NODES["TL2"], NODES["CrossA"], NODES["OutSbyMlg"]],
    [NODES["InDarmo"], NODES["TL2"], NODES["CrossA"], NODES["TL4"], NODES["CrossB"], NODES["OutAhYani"]],
    [NODES["InAhYani"], NODES["CrossB"], NODES["TL3"], NODES["MidStWono"], NODES["OutStWono"]],
    [NODES["InSbyMlg"], NODES["TL5"], NODES["CrossB"], NODES["OutAhYani"]],
]