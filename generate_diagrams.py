from PIL import Image, ImageDraw, ImageFont

# load font
try:
    font = ImageFont.truetype("arial.ttf", 16)
except Exception:
    font = ImageFont.load_default()

# helper function to draw entity boxes

def draw_entity(draw, x, y, w, h, title, attrs, font):
    draw.rectangle([x, y, x+w, y+h], fill="#f2f2f2", outline="black", width=2)
    draw.text((x+10, y+10), title, fill="black", font=font)
    y0 = y + 40
    for attr in attrs:
        draw.text((x+12, y0), attr, fill="black", font=font)
        y0 += 22

# ER diagram
img = Image.new("RGB", (1400, 950), "white")
d = ImageDraw.Draw(img)

drawn = [
    (50, 100, 320, 180, "Player", ["player_id (PK)", "username", "email", "country", "rank1", "user_id (FK)"]),
    (580, 100, 320, 140, "User", ["id (PK)", "email", "password", "role", "created_at"]),
    (50, 340, 320, 145, "Tournament", ["tournament_id (PK)", "tournament_name", "start_date", "end_date", "prize_pool", "status"]),
    (580, 340, 320, 200, "Registration", ["registration_id (PK)", "player_id (FK)", "tournament_id (FK)", "registration_date", "status", "application_type", "applied_by_admin"]),
    (50, 580, 320, 190, "Match", ["match_id (PK)", "tournament_id (FK)", "match_date", "stage", "player1_id (FK)", "player2_id (FK)", "character_used", "rounds_won", "result"]),
    (580, 620, 320, 140, "Leaderboard", ["lb_id (PK)", "player_id (FK)", "position", "total_points", "season"]),
]

for x, y, w, h, title, attrs in drawn:
    draw_entity(d, x, y, w, h, title, attrs, font)

# relationships
# Player - User
p_center = (50+320, 100+30)
u_center = (580, 100+30)

d.line([p_center, (p_center[0]+60, p_center[1]), (p_center[0]+60, u_center[1]), (u_center[0], u_center[1])], fill="black", width=2)
d.text((p_center[0]+15, p_center[1]-25), "linked_to", fill="black", font=font)
d.text((p_center[0]+10, p_center[1]+5), "0..1", fill="black", font=font)
d.text((u_center[0]-40, u_center[1]+5), "0..1", fill="black", font=font)

# Player - Registration
reg_top = (580, 340+70)
p_bottom = (50+160, 100+180)
d.line([p_bottom, (p_bottom[0], p_bottom[1]+50), (reg_top[0]-40, p_bottom[1]+50), (reg_top[0]-40, reg_top[1]), reg_top], fill="black", width=2)
d.text((330, p_bottom[1]+10), "applies", fill="black", font=font)
d.text((p_bottom[0]-30, p_bottom[1]+25), "1..*", fill="black", font=font)
d.text((reg_top[0]-60, reg_top[1]+5), "0..*", fill="black", font=font)

# Tournament - Registration
t_bottom = (50+160, 340+145)
d.line([t_bottom, (t_bottom[0], t_bottom[1]+40), (reg_top[0]-120, t_bottom[1]+40), (reg_top[0]-120, reg_top[1]), reg_top], fill="black", width=2)
d.text((220, t_bottom[1]+10), "receives", fill="black", font=font)
d.text((t_bottom[0]-20, t_bottom[1]+20), "1..*", fill="black", font=font)
d.text((reg_top[0]-110, reg_top[1]+5), "0..*", fill="black", font=font)

# Tournament - Match
m_top = (50+160, 580)
t_right = (50+320, 340+20)
d.line([t_right, (t_right[0]+120, t_right[1]), (t_right[0]+120, m_top[1]-30), (m_top[0], m_top[1]-30), m_top], fill="black", width=2)
d.text((t_right[0]+10, t_right[1]-25), "hosts", fill="black", font=font)
d.text((t_right[0]+10, t_right[1]+5), "1..*", fill="black", font=font)
d.text((m_top[0]-50, m_top[1]-30), "0..*", fill="black", font=font)

# Player - Match
p_mid = (50+320, 100+120)
m_left = (50+320, 580+70)
d.line([p_mid, (p_mid[0]+40, p_mid[1]), (p_mid[0]+40, m_left[1]), (m_left[0], m_left[1])], fill="black", width=2)
d.text((p_mid[0]+10, p_mid[1]-20), "competes_in", fill="black", font=font)
d.text((p_mid[0]+10, p_mid[1]+5), "0..*", fill="black", font=font)
d.text((m_left[0]-50, m_left[1]+5), "0..*", fill="black", font=font)

# Player - Leaderboard
lb_top = (580, 620+30)
d.line([p_mid, (p_mid[0]+40, p_mid[1]), (p_mid[0]+40, lb_top[1]), (580, lb_top[1])], fill="black", width=2)
d.text((p_mid[0]+10, p_mid[1]+20), "ranked", fill="black", font=font)
d.text((p_mid[0]+10, p_mid[1]+40), "1..*", fill="black", font=font)
d.text((580-50, lb_top[1]+5), "0..*", fill="black", font=font)

# title
nd = ImageDraw.Draw(img)
nd.text((50, 20), "ER Diagram (Chen notation)", fill="black", font=font)
img.save("er_diagram.jpg", quality=95)

# Relational schema diagram
img2 = Image.new("RGB", (1400, 950), "white")
d2 = ImageDraw.Draw(img2)

rects = [
    (50, 100, 380, 40, "users", ["id PK", "email", "password", "role", "created_at"]),
    (520, 100, 380, 40, "players", ["player_id PK", "username", "email", "country", "rank1", "user_id FK -> users.id"]),
    (990, 100, 380, 40, "tournaments", ["tournament_id PK", "tournament_name", "start_date", "end_date", "prize_pool", "status"]),
    (50, 420, 380, 40, "registrations", ["registration_id PK", "player_id FK -> players.player_id", "tournament_id FK -> tournaments.tournament_id", "registration_date", "status", "application_type", "applied_by_admin"]),
    (520, 420, 380, 40, "matches", ["match_id PK", "tournament_id FK -> tournaments.tournament_id", "match_date", "stage", "player1_id FK -> players.player_id", "player2_id FK -> players.player_id", "character_used", "rounds_won", "result"]),
    (990, 420, 380, 40, "leaderboard", ["lb_id PK", "player_id FK -> players.player_id", "position", "total_points", "season"]),
]

for x, y, w, h, title, attrs in rects:
    draw_entity(d2, x, y, w, h, title, attrs, font)

# relationships arrows/lines

d2.line([420, 160, 520, 160], fill="black", width=3)
d2.text((435, 145), "user_id -> users.id", fill="black", font=font)

d2.line([760, 200, 990, 200], fill="black", width=3)
d2.text((780, 185), "tournament_id -> tournaments.tournament_id", fill="black", font=font)

d2.line([190, 360, 190, 420], fill="black", width=3)
d2.text((200, 360), "player_id -> players.player_id", fill="black", font=font)

d2.line([700, 360, 700, 420], fill="black", width=3)
d2.text((710, 360), "tournament_id -> tournaments.tournament_id", fill="black", font=font)

d2.line([720, 300, 720, 420], fill="black", width=3)
d2.text((730, 300), "player1_id/player2_id -> players.player_id", fill="black", font=font)

d2.line([1090, 300, 1090, 420], fill="black", width=3)
d2.text((1100, 300), "player_id -> players.player_id", fill="black", font=font)

d2.text((50, 20), "Relational Schema", fill="black", font=font)
img2.save("relational_schema.jpg", quality=95)

# Extended EER diagram
img3 = Image.new("RGB", (1600, 1100), "white")
d3 = ImageDraw.Draw(img3)

entities = [
    (50, 100, 380, 160, "users", ["id PK", "email", "password", "role", "created_at"]),
    (50, 340, 380, 180, "players", ["player_id PK", "username", "email", "country", "rank1", "user_id FK"]),
    (990, 100, 380, 145, "tournaments", ["tournament_id PK", "tournament_name", "start_date", "end_date", "prize_pool", "status"]),
    (520, 340, 380, 200, "registrations", ["registration_id PK", "player_id FK", "tournament_id FK", "registration_date", "status", "application_type", "applied_by_admin"]),
    (990, 520, 380, 190, "matches", ["match_id PK", "tournament_id FK", "match_date", "stage", "player1_id FK", "player2_id FK", "character_used", "rounds_won", "result"]),
    (50, 700, 380, 140, "leaderboard", ["lb_id PK", "player_id FK", "position", "total_points", "season"]),
]

for x, y, w, h, title, attrs in entities:
    draw_entity(d3, x, y, w, h, title, attrs, font)


def draw_diamond(draw, cx, cy, size, text, font):
    points = [(cx, cy-size), (cx+size, cy), (cx, cy+size), (cx-size, cy)]
    draw.polygon(points, fill="#d9ead3", outline="black", width=2)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    draw.text((cx-text_w/2, cy-text_h/2), text, fill="black", font=font)
    return (cx, cy)


def connect(draw, x1, y1, x2, y2, label, font, dx=0, dy=0):
    draw.line([x1, y1, x2, y2], fill="black", width=2)
    tx = (x1 + x2) / 2 + dx
    ty = (y1 + y2) / 2 + dy
    draw.text((tx, ty), label, fill="black", font=font)

# Relationship diamonds
link_diamond = draw_diamond(d3, 450, 180, 40, "links", font)
reg_diamond = draw_diamond(d3, 450, 430, 40, "registers", font)
tour_diamond = draw_diamond(d3, 900, 430, 40, "holds", font)
play_diamond = draw_diamond(d3, 450, 700, 40, "plays", font)
host_diamond = draw_diamond(d3, 900, 700, 40, "hosts", font)
rank_diamond = draw_diamond(d3, 450, 930, 40, "ranked", font)

# Connect users to players
connect(d3, 230, 180, 410, 180, "0..1", font, dx=-80, dy=-20)
connect(d3, 490, 180, 570, 180, "0..1", font, dx=0, dy=-20)

# Connect players to registrations
connect(d3, 230, 430, 410, 430, "1..*", font, dx=-80, dy=-20)
connect(d3, 490, 430, 730, 430, "0..*", font, dx=0, dy=-20)

# Connect tournaments to registrations
connect(d3, 1070, 180, 870, 180, "1..*", font, dx=-90, dy=-20)
connect(d3, 930, 430, 830, 430, "0..*", font, dx=-120, dy=-20)

# Connect tournaments to matches
connect(d3, 1160, 430, 860, 430, "1..*", font, dx=-90, dy=-20)
connect(d3, 930, 610, 860, 700, "0..*", font, dx=-40, dy=-20)

# Connect players to matches
connect(d3, 230, 640, 410, 700, "0..*", font, dx=-70, dy=-20)
connect(d3, 510, 700, 770, 700, "0..*", font, dx=-60, dy=-20)

# Connect players to leaderboard
connect(d3, 230, 820, 410, 930, "1..*", font, dx=-70, dy=-20)
connect(d3, 510, 930, 570, 930, "0..*", font, dx=0, dy=-20)

# Labels and title

d3.text((50, 20), "EER Diagram", fill="black", font=font)
img3.save("eerd_diagram.jpg", quality=95)

print("Diagram images generated: er_diagram.jpg, relational_schema.jpg, eerd_diagram.jpg")
