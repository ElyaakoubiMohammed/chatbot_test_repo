
import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from datetime import datetime
import shutil

# ========== HARD CODED USERS ==========
VALID_USERS = {
    "chafiaaabida@gmail.com": "abida123",
    "elyaakoubimohammed@gmail.com": "mohammed123"
}

# ========== FLASK SETUP ==========
app = Flask(__name__)
app.secret_key = "fake_secret_key_for_session"
CORS(app)

# ========== CONVERSATION STORAGE ==========
CONVERSATIONS_DIR = "conversations"
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

def load_conversations(user_email):
    """Load user's conversation from JSON file"""
    file_path = os.path.join(CONVERSATIONS_DIR, f"{user_email}.json")
    if not os.path.exists(file_path):
        # Initialize with empty conversations
        save_conversations({}, user_email)
        return {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = f.read().strip()
            if not data:
                return {}
            return json.loads(data)
    except Exception as e:
        print(f"Error loading conversations for {user_email}: {e}")
        return {}

def save_conversations(conversations, user_email):
    """Save user's conversations to JSON file"""
    file_path = os.path.join(CONVERSATIONS_DIR, f"{user_email.replace('@', '_').replace('.', '_')}.json")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(conversations, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved conversations for {user_email}")
    except Exception as e:
        print(f"Error saving conversations for {user_email}: {e}")

# ========== HARD CODED SCRIPTS ==========
SCRIPT_USER1 = [
    {
        "user": "Salut, comment ça va ?",
        "bot": "Je suis un assistant IA, donc je ne ressens pas d’émotions comme un humain, mais je fonctionne parfaitement et je suis prêt à vous aider pour tout ce dont vous avez besoin. Si je pouvais ressentir quelque chose, je dirais que je suis curieux et impatient de voir nos échanges. Et vous, comment allez-vous ?"
    },
    {
        "user": "Ça va, merci. Est-ce que tu peux me dire un truc intéressant qui n’a rien à voir avec le travail ?",
        "bot": "Bien sûr ! Saviez-vous que le béton utilisé aujourd’hui peut être conçu pour absorber le dioxyde de carbone de l’air et réduire l’empreinte carbone des bâtiments ? C’est un exemple d’innovation durable dans la construction."
    },
    {
        "user": "Peux tu me donner un aperçu des activités récentes du LPEE dans le béton et matériaux ?",
        "bot": "Bien sûr. Depuis janvier 2025, le LPEE a analysé et validé plus de 1 000 échantillons de béton sur différents chantiers au Maroc. Les contrôles portaient sur la résistance mécanique, la durabilité et la conformité aux normes NM 10.1.004 et NM 10.2.008. On observe également une hausse des demandes liées aux matériaux recyclés et aux solutions de construction durable."
    },
    {
        "user": "Quels sont les projets les plus suivis récemment ?",
        "bot": "Les principaux projets sont :\n\nTramway Casablanca, Extension Ligne 2\n\nAutoroute Casablanca-Rabat, Lot 3\n\nPort Tanger Med, Zone logistique\nPour chacun, le LPEE a effectué des essais de matériaux et suivi la qualité sur site, en émettant des recommandations détaillées pour garantir la conformité."
    },
    {
        "user": "Can you tell me about the geotechnical studies conducted this year?",
        "bot": "Yes. In 2025, LPEE performed over 3,000 soil and foundation studies for various infrastructure projects. Common issues detected were low soil compaction in coastal regions and clay layers requiring stabilization. For each case, engineers provided specific recommendations to ensure safe construction and structural stability."
    },
    {
        "user": "Et au niveau des laboratoires, quels tests sont les plus fréquents ?",
        "bot": "Les tests les plus demandés sont :\n\nRésistance à la compression du béton\n\nAnalyses granulométriques des matériaux\n\nEssais de durabilité et vieillissement\n\nContrôle de qualité des enrobés bitumineux\nCes quatre catégories représentent environ 75 % des demandes globales."
    },
    {
        "user": "Est-ce que les IA comme toi peuvent apprendre de nouvelles choses par elles-mêmes ?",
        "bot": "Je peux traiter et analyser les données qui me sont fournies, mais je n’apprends pas de façon autonome comme un humain. Je fonctionne en utilisant les informations et les modèles qui m’ont été programmés."
    }
]

SCRIPT_USER2 = [
    { 
        "user": "Bonjour", 
        "bot": "Bonjour, je suis à votre disposition pour vous assister. Comment puis-je vous aider aujourd’hui ?" 
    },
    {
        "user": "Peux tu me donner un aperçu rapide des anomalies ou non-conformités récentes ?",
        "bot": "Oui, environ 4 % des échantillons ont présenté des écarts : certains bétons légèrement en dessous de la résistance attendue et quelques granulats non conformes aux spécifications. Pour chaque cas, le LPEE a fourni des recommandations détaillées pour corriger les anomalies."
    },
    {
        "user": "Que penses tu de la performance du secteur environnement ?",
        "bot": "Le secteur environnement affiche une performance remarquable avec une croissance de +15.3%, la plus élevée de tous les secteurs d'activité du LPEE. Cette forte progression s'explique probablement par plusieurs facteurs :\nPremièrement, le renforcement du cadre réglementaire environnemental au Maroc pousse les entreprises et collectivités à multiplier les études d'impact et contrôles de conformité.\nDeuxièmement, la sensibilisation croissante aux enjeux écologiques génère une demande accrue d'analyses de qualité de l'air, de l'eau et des sols.\nAvec 552 analyses réalisées (17% du volume total) et un délai moyen de 10.8 jours, ce secteur trouve un équilibre intéressant entre volume d'activité et efficacité opérationnelle. Le délai reste raisonnable comparé à la géotechnique (14.5 jours) ou aux structures (18.3 jours), tout en étant plus long que les matériaux de construction (7.2 jours), ce qui reflète la complexité technique des analyses environnementales.\nCette dynamique positionne l'environnement comme un secteur d'avenir pour le LPEE, avec un potentiel de croissance soutenu dans les années à venir, notamment avec les grands projets d'infrastructure verte du royaume."
    },
    {
        "user": "Can you tell me about the geotechnical studies conducted this year?",
        "bot": "Yes. In 2025, LPEE performed over 3,000 soil and foundation studies for various infrastructure projects. Common issues detected were low soil compaction in coastal regions and clay layers requiring stabilization. For each case, engineers provided specific recommendations to ensure safe construction and structural stability."
    },
    {
        "user": "Merci",
        "bot": "Avec plaisir ! N’hésitez pas à revenir vers moi si vous avez d’autres questions."
    }

]

def get_bot_reply(user_email, user_message):
    """Return hardcoded bot reply based on user and message"""
    if user_email == "chafiaaabida@gmail.com":
        for item in SCRIPT_USER1:
            if item["user"].strip().lower() == user_message.strip().lower():
                return item["bot"]
    elif user_email == "elyaakoubimohammed@gmail.com":
        for item in SCRIPT_USER2:
            if item["user"].strip().lower() == user_message.strip().lower():
                return item["bot"]
    return "Je ne comprends pas votre question. Veuillez consulter les exemples de dialogue."

# ========== API ROUTES ==========

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    if email in VALID_USERS and VALID_USERS[email] == password:
        session['user_email'] = email
        convos = load_conversations(email)
        return jsonify({
            'success': True,
            'userId': email,
            'conversations': convos
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    if email in VALID_USERS:
        return jsonify({'error': 'User already exists'}), 400

    # Only allow hardcoded users to "sign up"
    if email not in VALID_USERS:
        return jsonify({'error': 'Unauthorized user'}), 403

    if VALID_USERS[email] != password:
        return jsonify({'error': 'Invalid credentials'}), 401

    session['user_email'] = email
    convos = load_conversations(email)
    return jsonify({
        'success': True,
        'userId': email,
        'conversations': convos
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    user_email = request.args.get('userId')
    if not user_email:
        return jsonify({'error': 'User ID required'}), 400
    convos = load_conversations(user_email)
    return jsonify(convos)

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    user_email = request.json.get('userId')
    if not user_email:
        return jsonify({'error': 'User ID required'}), 400

    convos = load_conversations(user_email)
    convo_id = str(uuid.uuid4())
    convos[convo_id] = {
        "title": "Nouvelle conversation",
        "messages": []
    }
    save_conversations(convos, user_email)
    return jsonify({"id": convo_id})

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    user_email = request.args.get('userId')
    if not user_email:
        return jsonify({'error': 'User ID required'}), 400

    convos = load_conversations(user_email)
    if conversation_id in convos:
        del convos[conversation_id]
        save_conversations(convos, user_email)
        return jsonify({"status": "deleted"})
    else:
        return jsonify({"error": "Conversation not found"}), 404

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('messages', [{}])[-1].get('content')
    conversation_id = data.get('conversationId')
    user_email = data.get('userId')

    if not user_email or not conversation_id or not user_message:
        return jsonify({'error': 'Missing required data'}), 400

    convos = load_conversations(user_email)
    if conversation_id not in convos:
        convos[conversation_id] = {
            "title": "Nouvelle conversation",
            "messages": []
        }

    # Add user message
    convos[conversation_id]["messages"].append({
        "role": "user",
        "content": user_message
    })

    # Get bot reply from script
    bot_reply = get_bot_reply(user_email, user_message)
    convos[conversation_id]["messages"].append({
        "role": "assistant",
        "content": bot_reply
    })

    # Update title after first reply
    # Set hardcoded script-based title
    if len(convos[conversation_id]["messages"]) == 2:
        if user_email == "chafiaaabida@gmail.com":
            convos[conversation_id]["title"] = "Script 1: LPEE Béton & Matériaux"
        elif user_email == "elyaakoubimohammed@gmail.com":
            convos[conversation_id]["title"] = "Script 2: Performance Environnement"

    save_conversations(convos, user_email)
    return jsonify({"content": bot_reply})

@app.route('/api/update-title', methods=['POST'])
def update_title():
    data = request.get_json()
    conversation_id = data.get("conversationId")
    new_title = data.get("title")
    user_email = data.get("userId")

    if not user_email or not conversation_id or not new_title:
        return jsonify({"error": "Missing data"}), 400

    convos = load_conversations(user_email)
    if conversation_id in convos:
        convos[conversation_id]["title"] = new_title
        save_conversations(convos, user_email)
    return jsonify({"status": "success"})

@app.route('/api/edit-message', methods=['POST'])
def edit_message():
    data = request.get_json()
    conversation_id = data.get("conversationId")
    message_index = data.get("messageIndex")
    new_content = data.get("newContent")
    user_email = data.get("userId")

    if not all([conversation_id, message_index is not None, new_content, user_email]):
        return jsonify({"error": "Missing data"}), 400

    convos = load_conversations(user_email)
    if conversation_id not in convos:
        return jsonify({"error": "Conversation not found"}), 404

    messages = convos[conversation_id]["messages"]
    if message_index >= len(messages) or messages[message_index]["role"] != "user":
        return jsonify({"error": "Invalid message index"}), 400

    # Edit user message
    old_content = messages[message_index]["content"]
    messages[message_index]["content"] = new_content

    # Remove assistant reply and all after
    if message_index + 1 < len(messages) and messages[message_index + 1]["role"] == "assistant":
        del messages[message_index + 1:]

    # Regenerate assistant reply
    bot_reply = get_bot_reply(user_email, new_content)
    messages.append({"role": "assistant", "content": bot_reply})

    save_conversations(convos, user_email)
    return jsonify({"content": bot_reply})

# ========== HEALTH & STATIC ==========
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

# ========== START SERVER ==========
if __name__ == '__main__':
    app.run(debug=True, port=5000)
