import json
import os
import random

INPUT_LOCALITIES_FILE = 'localities.json'
FRONTEND_OUTPUT_FILE = '../frontend/src/data/sub_localities.json'
BACKEND_OUTPUT_FILE = 'sub_localities.json'

# Real-world locality names to match what generate_real_localities.py gives them:
REAL_LOCALITIES_MAPPING = {
    # ── Karnataka ──
    "Bangalore": [
        "Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Electronic City",
        "Jayanagar", "JP Nagar", "BTM Layout", "Marathahalli", "Bellandur"
    ],
    "Mysore": ["Saraswathipuram", "Gokulam", "Vijayanagar"],
    "Mangalore": ["Kadri", "Bejai", "Falnir"],
    
    # ── Maharashtra ──
    "Mumbai": [
        "Andheri West", "Bandra West", "Juhu", "Powai", "Goregaon East",
        "Malad West", "Kandivali East", "Borivali West", "Colaba", "Dadar"
    ],
    "Pune": [
        "Koregaon Park", "Viman Nagar", "Kalyani Nagar", "Hinjewadi", "Wakad",
        "Baner", "Kothrud", "Hadapsar"
    ],
    "Nagpur": ["Dharampeth", "Sadar", "Civil Lines"],
    
    # ── Telangana ──
    "Hyderabad": [
        "Ameerpet", "Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli",
        "Madhapur", "Kukatpally", "Begumpet", "Kondapur", "Somajiguda",
        "SR Nagar", "Panjagutta", "Mehdipatnam", "Secunderabad", "LB Nagar"
    ],
    "Warangal": ["Hanamkonda", "Kazipet", "Subedari"],
    "Karimnagar": ["Mukarampura", "Saptagiri Colony", "Kashmirgadda"],
    
    # ── Delhi ──
    "Delhi": [
        "Connaught Place", "Hauz Khas", "Vasant Kunj", "Saket", "Greater Kailash",
        "Dwarka", "Rohini", "Janakpuri", "Lajpat Nagar", "Karol Bagh"
    ],
    "New Delhi": [
        "Connaught Place", "Hauz Khas", "Vasant Kunj", "Saket", "Greater Kailash"
    ],

    # ── Tamil Nadu ──
    "Chennai": [
        "T Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore",
        "Alwarpet", "Besant Nagar", "Nungambakkam", "Tambaram", "Guindy"
    ],
    "Coimbatore": ["RS Puram", "Gandhipuram", "Peelamedu"],

    # ── Gujarat ──
    "Ahmedabad": [
        "SG Highway", "Bopal", "Satellite", "Vastrapur", "Thaltej",
        "Prahlad Nagar", "Bodakdev", "Navrangpura"
    ],
    "Surat": ["Vesu", "Adajan", "Piplod", "Althan", "Pal"],
    "Vadodara": ["Alkapuri", "Race Course", "Manjalpur"],

    # ── Rajasthan ──
    "Jaipur": [
        "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park"
    ],
    "Udaipur": ["Fatehpura", "Hiran Magri", "Shobhagpura"],

    # ── Uttar Pradesh ──
    "Noida": ["Sector 62", "Sector 18", "Sector 50", "Sector 137", "Sector 44"],
    "Lucknow": ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj"],
    "Ghaziabad": ["Indirapuram", "Vaishali", "Crossing Republik"],

    # ── West Bengal ──
    "Kolkata": [
        "Salt Lake", "New Town", "Rajarhat", "Ballygunge", "Alipore",
        "Jadavpur", "Gariahat", "Behala"
    ]
}

from sub_loc_data import HUGE_SUB_LOCALITIES

STATE_REGION_SUFFIXES = {
    "Karnataka": ["Layout", "Extension", "Cross", "Block", "Nagar", "Stage"],
    "Maharashtra": ["East", "West", "Wadi", "Naka", "Peth", "Nagar"],
    "Telangana": ["Colony", "X Roads", "Thota", "Guda", "Nagar", "Pet"],
    "Delhi": ["Block", "Enclave", "Vihar", "Nagar", "Extension"],
    "Tamil Nadu": ["South", "North", "Main Road", "Street", "Nagar", "Salai"],
    "Gujarat": ["Cross Road", "Ring Road", "Approach", "Nagar", "Park"],
    "Rajasthan": ["Marg", "Choraha", "Nagar", "Vihar", "Colony"],
    "Uttar Pradesh": ["Khand", "Puram", "Enclave", "Vihar", "Nagar"],
    "West Bengal": ["Sarani", "Park", "Bagan", "Avenue", "Pally"],
    "Kerala": ["Junction", "Mukku", "Kavu", "Nagar", "Padi"],
    "Others": ["Phase 1", "Phase 2", "Extension", "Colony", "Sector", "Nagar"]
}

# Determine the region category based on City (using our internal mapping rules)
def get_city_region(city):
    karnataka = ["Bangalore", "Mysore", "Hubli", "Mangalore"]
    maharashtra = ["Mumbai", "Pune", "Nagpur", "Thane"]
    telangana = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"]
    delhi = ["Delhi", "New Delhi", "Dwarka", "Rohini", "Saket"]
    tamil_nadu = ["Chennai", "Coimbatore", "Madurai", "Salem"]
    gujarat = ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
    rajasthan = ["Jaipur", "Udaipur", "Jodhpur", "Kota"]
    up = ["Noida", "Lucknow", "Ghaziabad", "Agra"]
    wb = ["Kolkata", "Howrah", "Durgapur", "Siliguri"]
    kerala = ["Kochi", "Trivandrum", "Calicut", "Thrissur"]

    if city in karnataka: return "Karnataka"
    if city in maharashtra: return "Maharashtra"
    if city in telangana: return "Telangana"
    if city in delhi: return "Delhi"
    if city in tamil_nadu: return "Tamil Nadu"
    if city in gujarat: return "Gujarat"
    if city in rajasthan: return "Rajasthan"
    if city in up: return "Uttar Pradesh"
    if city in wb: return "West Bengal"
    if city in kerala: return "Kerala"
    return "Others"

def generate_sub_localities():
    if not os.path.exists(INPUT_LOCALITIES_FILE):
        print(f"Error: Could not find {INPUT_LOCALITIES_FILE}")
        return

    with open(INPUT_LOCALITIES_FILE, 'r') as f:
        data = json.load(f)

    sub_localities_mapping = {}

    random.seed(42)  # For consistent output

    for city, model_localities in data.items():
        name_list = REAL_LOCALITIES_MAPPING.get(city, [])
        region_suffixes = STATE_REGION_SUFFIXES[get_city_region(city)]

        for i, loc_value in enumerate(model_localities):
            sub_locs = []
            
            # If we happen to know the real name of this locality
            real_name = None
            if i < len(name_list):
                real_name = name_list[i]
                
            if real_name and real_name in HUGE_SUB_LOCALITIES:
                sub_locs = HUGE_SUB_LOCALITIES[real_name]
            else:
                # Generate 3-4 realistic generic sub-localities using state-aware suffixes
                num_subs = random.randint(2, 4)
                used_names = set()
                
                # Base real name isn't available in SPECIFIC, but we might know it realistically
                base = real_name if real_name else city
                
                for j in range(num_subs):
                    multiplier = round(random.uniform(0.85, 1.15), 2)
                    
                    if real_name:
                        # e.g., "Kukatpally X Roads", "Kukatpally Colony"
                        prefix = ""
                        suffix = random.choice(region_suffixes)
                    else:
                        # e.g., "North Hyderabad X Roads"
                        prefix = random.choice(["North", "South", "East", "West", "Old", "New"]) + " "
                        suffix = random.choice(region_suffixes) + " " + str(random.randint(1,5))

                    sub_name = f"{prefix}{base} {suffix}".strip()
                    
                    # Ensure uniqueness
                    if sub_name not in used_names:
                        sub_locs.append({
                            "name": sub_name,
                            "multiplier": multiplier
                        })
                        used_names.add(sub_name)

            compound_key = f"{city}_{loc_value}"
            sub_localities_mapping[compound_key] = sub_locs

    frontend_dir = os.path.dirname(FRONTEND_OUTPUT_FILE)
    if frontend_dir:
        os.makedirs(frontend_dir, exist_ok=True)
        
    backend_dir = os.path.dirname(BACKEND_OUTPUT_FILE)
    if backend_dir:
        os.makedirs(backend_dir, exist_ok=True)
    with open(FRONTEND_OUTPUT_FILE, 'w') as f:
        json.dump(sub_localities_mapping, f, indent=4)
        
    with open(BACKEND_OUTPUT_FILE, 'w') as f:
        json.dump(sub_localities_mapping, f, indent=4)
        
    print(f"Successfully created sub-localities mapping at {FRONTEND_OUTPUT_FILE} and {BACKEND_OUTPUT_FILE}")

if __name__ == "__main__":
    generate_sub_localities()
