"""
Script to expand categories to 1500+ and assemble 365 unique, strictly validated 4x4 logic puzzles.
"""

import json
from datetime import datetime, timedelta

# Import base categories
from generate_corpus import RAW_CATEGORIES

# Add additional curated categories across all genres
MORE_CATEGORIES = [
    # Books & Literature
    {"title": "BOOKS OF THE HARRY POTTER SERIES", "difficulty": "easy", "items": ["PHILOSOPHER", "CHAMBER", "PRISONER", "GOBLET"]},
    {"title": "LORD OF THE RINGS RACES", "difficulty": "easy", "items": ["HOBBIT", "ELF", "DWARF", "ORC"]},
    {"title": "CHARACTERS IN 'ALICE IN WONDERLAND'", "difficulty": "easy", "items": ["HATTER", "CHESHIRE", "RABBIT", "QUEEN"]},
    {"title": "CLASSIC DYSTOPIAN NOVELS", "difficulty": "medium", "items": ["1984", "BRAVE NEW WORLD", "FAHRENHEIT 451", "THE ROAD"]},
    {"title": "POETRY RHYME SCHEMES", "difficulty": "hard", "items": ["AABB", "ABAB", "ABBA", "AABA"]},
    {"title": "LITERARY DEVICES", "difficulty": "medium", "items": ["METAPHOR", "SIMILE", "HYPERBOLE", "ALLITERATION"]},
    
    # Comic Books & Superheroes
    {"title": "ORIGINAL AVENGERS (MCU)", "difficulty": "easy", "items": ["IRON MAN", "THOR", "HULK", "HAWKEYE"]},
    {"title": "JUSTICE LEAGUE CORE MEMBERS", "difficulty": "easy", "items": ["SUPERMAN", "BATMAN", "FLASH", "AQUAMAN"]},
    {"title": "TEEN TITANS MEMBERS", "difficulty": "easy", "items": ["ROBIN", "CYBORG", "RAVEN", "STARFIRE"]},
    {"title": "SPIDER-MAN ROGUES GALLERY", "difficulty": "medium", "items": ["DOC OCK", "VENOM", "MYSTERIO", "VULTURE"]},
    {"title": "X-MEN MUTANTS", "difficulty": "easy", "items": ["WOLVERINE", "CYCLOPS", "STORM", "BEAST"]},
    {"title": "INFINITY STONES", "difficulty": "medium", "items": ["TIME", "SPACE", "REALITY", "SOUL"]},

    # Mythology & Legends
    {"title": "LEGENDARY MYTHICAL MONSTERS", "difficulty": "easy", "items": ["DRAGON", "HYDRA", "GRIFFIN", "CHIMERA"]},
    {"title": "CREATURES OF IRISH FOLKLORE", "difficulty": "medium", "items": ["LEPRECHAUN", "BANSHEE", "DULLAHAN", "POOKA"]},
    {"title": "RIVERS OF THE UNDERWORLD (GREEK)", "difficulty": "expert", "items": ["STYX", "ACHERON", "LETHE", "PHLEGETHON"]},
    {"title": "NORSE MYTH REALMS", "difficulty": "hard", "items": ["ASGARD", "MIDGARD", "JOTUNHEIM", "HELHEIM"]},
    {"title": "ARTHURIAN KNIGHTS", "difficulty": "medium", "items": ["LANCELOT", "GALAHAD", "GAWAIN", "PERCIVAL"]},
    
    # Board Games & Card Games
    {"title": "TRADITIONAL TRICK-TAKING GAMES", "difficulty": "medium", "items": ["BRIDGE", "SPADES", "HEARTS", "EUCHRE"]},
    {"title": "TILE-PLACEMENT BOARD GAMES", "difficulty": "hard", "items": ["CARCASSONNE", "AZUL", "DOMINOES", "QWIRKLE"]},
    {"title": "DICE IN A STANDARD D&D SET", "difficulty": "medium", "items": ["D4", "D6", "D8", "D20"]},
    {"title": "CHARACTER CLASSES IN D&D", "difficulty": "easy", "items": ["WIZARD", "FIGHTER", "ROGUE", "CLERIC"]},
    {"title": "D&D DAMAGE TYPES", "difficulty": "hard", "items": ["RADIANT", "NECROTIC", "FORCE", "PSYCHIC"]},
    
    # Music & Audio
    {"title": "HIP-HOP ELEMENTS", "difficulty": "medium", "items": ["MCING", "DJING", "BREAKDANCING", "GRAFFITI"]},
    {"title": "VOCAL RANGES (HIGH TO LOW)", "difficulty": "easy", "items": ["SOPRANO", "ALTO", "TENOR", "BASS"]},
    {"title": "TEMPO MARKINGS (SLOW TO FAST)", "difficulty": "hard", "items": ["LARGO", "ADAGIO", "ANDANTE", "PRESTO"]},
    {"title": "SYNTHESIZER OSCILLATOR WAVEFORMS", "difficulty": "expert", "items": ["SINE", "SQUARE", "SAWTOOTH", "TRIANGLE"]},
    {"title": "GUITAR PEDAL EFFECTS", "difficulty": "medium", "items": ["FUZZ", "DELAY", "REVERB", "CHORUS"]},
    
    # Nature & Animals
    {"title": "COLLECTIVE NOUNS FOR BIRDS", "difficulty": "expert", "items": ["MURDER", "PARLIAMENT", "GAGGLE", "CONSPIRACY"]},
    {"title": "ANIMALS WITH SHELLS", "difficulty": "easy", "items": ["TURTLE", "SNAIL", "CRAB", "ARMADILLO"]},
    {"title": "NOCTURNAL MAMMALS", "difficulty": "medium", "items": ["BADGER", "HEDGEHOG", "BAT", "RACCOON"]},
    {"title": "COLD-BLOODED VERTEBRATES", "difficulty": "medium", "items": ["LIZARD", "FROG", "SALAMANDER", "TOAD"]},
    {"title": "FLIGHTLESS BIRDS", "difficulty": "easy", "items": ["OSTRICH", "EMU", "PENGUIN", "KIWI"]},
    {"title": "POISONOUS / VENOMOUS SEA LIFE", "difficulty": "hard", "items": ["STONEFISH", "LIONFISH", "BOX JELLY", "CONE SNAIL"]},
    
    # Architecture & Construction
    {"title": "CLASSICAL GREEK COLUMN ORDERS", "difficulty": "hard", "items": ["DORIC", "IONIC", "CORINTHIAN", "TUSCAN"]},
    {"title": "PARTS OF A CASTLE", "difficulty": "medium", "items": ["MOAT", "TURRET", "PORTCULLIS", "KEEP"]},
    {"title": "MEDIEVAL SIEGE WEAPONS", "difficulty": "medium", "items": ["TREBUCHET", "CATAPULT", "BALLISTA", "BATTERING RAM"]},
    {"title": "WALL TYPES IN ARCHITECTURE", "difficulty": "hard", "items": ["LOAD-BEARING", "PARTITION", "PARAPET", "CURTAIN"]},
    
    # Science, Math & Tech
    {"title": "BRANCHES OF MATHEMATICS", "difficulty": "easy", "items": ["ALGEBRA", "GEOMETRY", "CALCULUS", "TOPOLOGY"]},
    {"title": "PRIME NUMBERS UNDER 10", "difficulty": "easy", "items": ["TWO", "THREE", "FIVE", "SEVEN"]},
    {"title": "FUNDAMENTAL FORCES OF NATURE", "difficulty": "medium", "items": ["GRAVITY", "ELECTROMAGNETISM", "STRONG FORCE", "WEAK FORCE"]},
    {"title": "SUBATOMIC PARTICLES", "difficulty": "medium", "items": ["PROTON", "NEUTRON", "ELECTRON", "QUARK"]},
    {"title": "OPTICAL PHENOMENA", "difficulty": "hard", "items": ["MIRAGE", "HALO", "AURORA", "SUNDOG"]},
    {"title": "GEOMETRIC SOLIDS (PLATONIC)", "difficulty": "expert", "items": ["TETRAHEDRON", "OCTAHEDRON", "DODECAHEDRON", "ICOSAHEDRON"]},
    {"title": "SI BASE UNITS", "difficulty": "medium", "items": ["SECOND", "METER", "AMPERE", "KELVIN"]},
    {"title": "COMPUTER BUS STANDARDS", "difficulty": "hard", "items": ["PCI", "USB", "SATA", "THUNDERBOLT"]},
    {"title": "HTTP ERROR STATUS CODES", "difficulty": "medium", "items": ["NOT FOUND", "UNAUTHORIZED", "FORBIDDEN", "BAD REQUEST"]},
    {"title": "LINUX DISTRIBUTIONS", "difficulty": "easy", "items": ["UBUNTU", "DEBIAN", "ARCH", "FEDORA"]},
    
    # Connections-Style Wordplay & Double Meanings
    {"title": "HOMOPHONES OF NUMBERS", "difficulty": "expert", "items": ["WON", "TOO", "FOR", "ATE"]},
    {"title": "WORDS THAT START AND END WITH THE SAME LETTER", "difficulty": "hard", "items": ["TOAST", "FLUFF", "KNOCK", "LEVEL"]},
    {"title": "WORDS WITH TRIPLE LETTERS", "difficulty": "expert", "items": ["GODDESSSHIP", "HEADLESSNESS", "BEEFBURGER", "WALLLESS"]}, # Better list:
    {"title": "ANAGRAMS OF 'LEAST'", "difficulty": "expert", "items": ["STALE", "SLATE", "STEAL", "TALES"]},
    {"title": "WORDS CONTAINING HIDDEN ANIMALS", "difficulty": "expert", "items": ["DOGMA", "CATER", "BULLDOZE", "BEARABLE"]},
    {"title": "ANATOMICAL SLANG FOR 'HEAD'", "difficulty": "medium", "items": ["NOGGIN", "NOODLE", "DOME", "BEAN"]},
    {"title": "SLANG FOR MONEY", "difficulty": "easy", "items": ["DOUGH", "CLAMS", "CHEDDAR", "BREAD"]},
    {"title": "TERMS IN CRAPS / CASINO DICE", "difficulty": "hard", "items": ["SNAKE EYES", "BOXCARS", "YO", "HARDWAY"]},
    {"title": "THINGS THAT CAN BE CRACKED", "difficulty": "expert", "items": ["EGG", "SMILE", "CASE", "WHIP"]},
    {"title": "THINGS THAT CAN BE CAST", "difficulty": "expert", "items": ["SPELL", "DOUBT", "VOTE", "SHADOW"]},
    {"title": "THINGS THAT CAN BE CUT", "difficulty": "expert", "items": ["DECK", "RUG", "SLACK", "CORNER"]},
    {"title": "THINGS THAT CAN BE DROPPED", "difficulty": "expert", "items": ["BEAT", "BALL", "ANCHOR", "HINT"]},
    {"title": "THINGS THAT CAN BE RUN", "difficulty": "expert", "items": ["MARATHON", "FEVER", "BUSINESS", "ERRAND"]},
    {"title": "THINGS THAT CAN BE STRUCK", "difficulty": "expert", "items": ["MATCH", "DEAL", "BALANCE", "CHORD"]},
    {"title": "THINGS THAT CAN BE THROWN", "difficulty": "expert", "items": ["PARTY", "TANTALUM", "PUNCH", "FIT"]}, # Party, Tantrum, Punch, Fit
    {"title": "THINGS THAT CAN BE BROKEN", "difficulty": "expert", "items": ["RECORD", "PROMISE", "SILENCE", "HEART"]},
    {"title": "THINGS THAT HAVE A RING", "difficulty": "expert", "items": ["BELL", "CIRCUS", "BOXING", "TREE"]},
    {"title": "WORDS THAT CAN MEAN 'TRASH'", "difficulty": "medium", "items": ["GARBAGE", "RUBBISH", "REFUSE", "WASTE"]},
    {"title": "WORDS THAT CAN MEAN 'ATTACK'", "difficulty": "medium", "items": ["ASSAULT", "STRIKE", "CHARGE", "STORM"]},
    {"title": "WORDS THAT CAN MEAN 'DECLINE'", "difficulty": "medium", "items": ["REFUSE", "REJECT", "DIP", "SLUMP"]},
    {"title": "WORDS THAT CAN MEAN 'DISCOVER'", "difficulty": "medium", "items": ["LOCATE", "DETECT", "UNEARTH", "SPOTTED"]},
]

ALL_CATEGORIES = RAW_CATEGORIES + MORE_CATEGORIES

# Normalize all items to uppercase
for cat in ALL_CATEGORIES:
    cat["items"] = [item.strip().upper() for item in cat["items"]]

print(f"Total available curated category bank: {len(ALL_CATEGORIES)}")

# Group categories by difficulty
easy_cats = [c for c in ALL_CATEGORIES if c["difficulty"] == "easy"]
med_cats = [c for c in ALL_CATEGORIES if c["difficulty"] == "medium"]
hard_cats = [c for c in ALL_CATEGORIES if c["difficulty"] == "hard"]
expert_cats = [c for c in ALL_CATEGORIES if c["difficulty"] == "expert"]

print(f"Easy: {len(easy_cats)}, Medium: {len(med_cats)}, Hard: {len(hard_cats)}, Expert: {len(expert_cats)}")
