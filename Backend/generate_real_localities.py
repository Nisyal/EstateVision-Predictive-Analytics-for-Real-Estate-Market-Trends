import json
import os

INPUT_FILE = 'c:/COLLEGE PROJECT/Backend/localities.json'
OUTPUT_FILE = 'c:/COLLEGE PROJECT/frontend/src/data/real_localities.json'

# Real-world locality names for ALL cities across all states
REAL_LOCALITIES_MAPPING = {
    # ── Karnataka ──
    "Bangalore": [
        "Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Electronic City",
        "Jayanagar", "JP Nagar", "BTM Layout", "Marathahalli", "Bellandur",
        "Malleshwaram", "Rajajinagar", "Yelahanka", "Hebbal", "Sarjapur Road",
        "Banashankari", "Basavanagudi", "Malleswaram", "KR Puram", "Hennur"
    ],
    "Mysore": [
        "Saraswathipuram", "Gokulam", "Vijayanagar", "Kuvempunagar", "Jayalakshmipuram",
        "Chamundipuram", "Hebbal", "Srirampura", "Lakshmipuram", "Nazarbad"
    ],
    "Hubli": [
        "Vidyanagar", "Keshwapur", "Gokul Road", "Navanagar", "Deshpande Nagar",
        "Lingarajnagar", "Shirur Park", "Akshay Colony", "Malmaddi", "Old Hubli"
    ],
    "Mangalore": [
        "Kadri", "Bejai", "Falnir", "Hampankatta", "Kankanady",
        "Bendoorwell", "Mannagudda", "Attavar", "Derebail", "Kottara"
    ],

    # ── Maharashtra ──
    "Mumbai": [
        "Andheri West", "Bandra West", "Juhu", "Powai", "Goregaon East",
        "Malad West", "Kandivali East", "Borivali West", "Colaba", "Dadar",
        "Worli", "Lower Parel", "Prabhadevi", "Chembur", "Navi Mumbai",
        "Thane", "Vile Parle", "Santacruz", "Mulund", "Ghatkopar"
    ],
    "Pune": [
        "Koregaon Park", "Viman Nagar", "Kalyani Nagar", "Hinjewadi", "Wakad",
        "Baner", "Kothrud", "Hadapsar", "Kharadi", "Magarpatta City",
        "Shivajinagar", "Aundh", "Camp", "Deccan Gymkhana", "Bavdhan",
        "Pimple Saudagar", "Pashan", "Wagholi", "Rasta Peth", "Swargate"
    ],
    "Nagpur": [
        "Dharampeth", "Sadar", "Civil Lines", "Sitabuldi", "Mankapur",
        "Ramdaspeth", "Laxmi Nagar", "Pratap Nagar", "Trimurti Nagar", "Manewada",
        "Bajaj Nagar", "Hingna", "Wardha Road", "Nandanvan", "Lakadganj",
        "Seminary Hills", "Jaripatka", "Congress Nagar", "Khamla", "Shankar Nagar"
    ],
    "Thane": [
        "Ghodbunder Road", "Majiwada", "Pokhran Road", "Manpada", "Vartak Nagar",
        "Naupada", "Wagle Estate", "Panchpakhadi", "Balkum", "Hiranandani Estate"
    ],

    # ── Tamil Nadu ──
    "Chennai": [
        "T Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore",
        "Alwarpet", "Besant Nagar", "Nungambakkam", "Tambaram", "Guindy",
        "Porur", "OMR", "Thiruvanmiyur", "Triplicane", "Egmore",
        "Medavakkam", "Perambur", "Vandaloor", "Pallikaranai", "Madipakkam"
    ],
    "Coimbatore": [
        "RS Puram", "Gandhipuram", "Peelamedu", "Saravanampatti", "Singanallur",
        "Race Course", "Thudiyalur", "Ganapathy", "Vadavalli", "Kovaipudur"
    ],
    "Madurai": [
        "Anna Nagar", "KK Nagar", "Mattuthavani", "Thirunagar", "Villapuram",
        "Goripalayam", "Tallakulam", "Palanganatham", "SS Colony", "Narimedu"
    ],
    "Salem": [
        "Fairlands", "Shevapet", "Hasthampatti", "Suramangalam", "Ammapet",
        "Alagapuram", "Kondalampatti", "Attur Road", "Gugai", "Steel Plant"
    ],

    # ── Delhi ──
    "New Delhi": [
        "Connaught Place", "Hauz Khas", "Vasant Kunj", "Saket", "Greater Kailash",
        "Dwarka", "Rohini", "Janakpuri", "Lajpat Nagar", "Karol Bagh",
        "Pitampura", "Vasant Vihar", "Rajouri Garden", "Def Col", "Malviya Nagar",
        "South Ex", "Green Park", "Chanakyapuri", "Nehru Place", "Laxmi Nagar"
    ],
    "Delhi": [
        "Connaught Place", "Hauz Khas", "Vasant Kunj", "Saket", "Greater Kailash",
        "Dwarka", "Rohini", "Janakpuri", "Lajpat Nagar", "Karol Bagh",
        "Pitampura", "Vasant Vihar", "Rajouri Garden", "Def Col", "Malviya Nagar",
        "South Ex", "Green Park", "Chanakyapuri", "Nehru Place", "Laxmi Nagar"
    ],
    "Dwarka": [
        "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
        "Sector 6", "Sector 7", "Sector 10", "Sector 12", "Sector 22"
    ],
    "Rohini": [
        "Sector 3", "Sector 5", "Sector 7", "Sector 8", "Sector 9",
        "Sector 11", "Sector 13", "Sector 15", "Sector 16", "Sector 24"
    ],
    "Saket": [
        "Saket J Block", "Saket G Block", "Saket Select City", "Malviya Nagar",
        "Saket M Block", "Press Enclave", "Saket A Block", "Neb Sarai",
        "Pushp Vihar", "Freedom Fighter Enclave"
    ],

    # ── Telangana ──
    "Hyderabad": [
        "Ameerpet", "Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli",
        "Madhapur", "Kukatpally", "Begumpet", "Kondapur", "Somajiguda",
        "SR Nagar", "Panjagutta", "Mehdipatnam", "Secunderabad", "LB Nagar",
        "Uppal", "Miyapur", "Tolichowki", "Dilsukhnagar", "Manikonda"
    ],
    "Warangal": [
        "Hanamkonda", "Kazipet", "Subedari", "Waddepally", "Gopalpur",
        "Bhavani Nagar", "Chintal", "LB Nagar", "Deshaipet", "Rangasaipet",
        "Balasamudram", "Lashkar Bazaar", "Fort Warangal", "Ramnagar", "Madikonda",
        "Nakkalagutta", "Hunter Road", "Mulugu Road", "Jangaon Road", "Naimnagar"
    ],
    "Nizamabad": [
        "Pragati Nagar", "Kanteshwar", "Ngo Colony", "Varni Road", "Vinayak Nagar",
        "Subhash Nagar", "Nizamabad Rural", "Borgaon", "Gautam Nagar", "Kamareddy"
    ],
    "Karimnagar": [
        "Mukarampura", "Saptagiri Colony", "Kashmirgadda", "Vidya Nagar", "Jyothinagar",
        "Bhagatnagar", "Mankammathota", "Chinthakunta", "Vavilalapally", "Hussainipura"
    ],

    # ── Gujarat ──
    "Ahmedabad": [
        "SG Highway", "Bopal", "Satellite", "Vastrapur", "Thaltej",
        "Prahlad Nagar", "Bodakdev", "Navrangpura", "Gota", "Chandkheda",
        "Mani Nagar", "Paldi", "Ellisbridge", "Science City Road", "Naranpura",
        "Vejalpur", "Ghatlodia", "Bapunagar", "Naroda", "Sabarmati"
    ],
    "Surat": [
        "Vesu", "Adajan", "Piplod", "Althan", "Pal",
        "Ghod Dod Road", "City Light", "Katargam", "Varachha", "Athwa"
    ],
    "Vadodara": [
        "Alkapuri", "Race Course", "Manjalpur", "Gotri", "Akota",
        "Karelibaug", "Fatehgunj", "Waghodia Road", "Sama", "Harni"
    ],
    "Rajkot": [
        "Kalawad Road", "University Road", "Yagnik Road", "150 Feet Ring Road", "Gondal Road",
        "Raiya Road", "Amin Marg", "Mavdi", "Kotecha Chowk", "Astron Chowk"
    ],

    # ── Rajasthan ──
    "Jaipur": [
        "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Raja Park",
        "Tonk Road", "Jagatpura", "Sanganer", "Sodala", "Bani Park",
        "Jhotwara", "Ajmer Road", "Durgapura", "Tilak Nagar", "Shyam Nagar",
        "Nirman Nagar", "Amer Road", "Mahesh Nagar", "Vidhyadhar Nagar", "Civil Lines"
    ],
    "Udaipur": [
        "Fatehpura", "Hiran Magri", "Shobhagpura", "Sukhadia Circle", "Chetak Circle",
        "Ambamata", "Bhuwana", "Goverdhan Vilas", "Udaipur City", "Pratap Nagar"
    ],
    "Jodhpur": [
        "Paota", "Ratanada", "Sardarpura", "Shastri Nagar", "Chopasni Road",
        "Basni", "Pal Road", "Kamla Nehru Nagar", "Mandore Road", "Air Force Area"
    ],
    "Kota": [
        "Talwandi", "Mahaveer Nagar", "Dadabari", "Borkhera", "Kunhari",
        "Vigyan Nagar", "Gumanpura", "Nayapura", "Rangbari", "Rajiv Gandhi Nagar"
    ],

    # ── Uttar Pradesh ──
    "Noida": [
        "Sector 62", "Sector 18", "Sector 50", "Sector 137", "Sector 44",
        "Sector 75", "Sector 76", "Sector 104", "Sector 120", "Sector 143",
        "Sector 15", "Sector 16", "Sector 22", "Sector 25", "Sector 30",
        "Sector 37", "Sector 41", "Sector 45", "Sector 63", "Sector 78"
    ],
    "Lucknow": [
        "Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj", "Mahanagar",
        "Rajajipuram", "Vikas Nagar", "Aminabad", "Alambagh", "Jankipuram",
        "Eldeco", "Charbagh", "Aashiana", "Sushant Golf City", "Sahara States",
        "Chinhat", "Faizabad Road", "Sitapur Road", "Kanpur Road", "Vrindavan Yojana"
    ],
    "Ghaziabad": [
        "Indirapuram", "Vaishali", "Crossing Republik", "Raj Nagar Extension", "Kaushambi",
        "Vasundhara", "Shalimar Garden", "Loni", "Govindpuram", "Sahibabad"
    ],
    "Agra": [
        "Taj Nagari", "Kamla Nagar", "Sikandra", "Dayal Bagh", "Shahganj",
        "Khandari", "Sanjay Place", "Civil Lines", "Fatehabad Road", "Raja Mandi"
    ],

    # ── West Bengal ──
    "Kolkata": [
        "Salt Lake", "New Town", "Rajarhat", "Ballygunge", "Alipore",
        "Jadavpur", "Gariahat", "Behala", "Tollygunge", "Park Street",
        "Kasba", "Dum Dum", "Lake Town", "Ruby", "Mukundapur",
        "Garia", "Naktala", "Phoolbagan", "Kankurgachi", "Bhawanipore"
    ],
    "Howrah": [
        "Shibpur", "Belur", "Liluah", "Kadamtala", "Santragachi",
        "Bally", "Ramrajatala", "Golabari", "Dasnagar", "Andul"
    ],
    "Durgapur": [
        "City Centre", "Benachity", "Bidhannagar", "Muchipara", "Steel Township",
        "Bamunara", "Nachan Road", "A-Zone", "B-Zone", "C-Zone"
    ],
    "Siliguri": [
        "Sevoke Road", "Hill Cart Road", "Pradhan Nagar", "Hakimpara", "Matigara",
        "Salugara", "Dagapur", "Bidhan Nagar", "Naxalbari", "Ashley Hall"
    ],

    # ── Kerala ──
    "Kochi": [
        "Edappally", "Kakkanad", "Palarivattom", "Vyttila", "Aluva",
        "Marine Drive", "Panampilly Nagar", "Kaloor", "Thripunithura", "Fort Kochi"
    ],
    "Trivandrum": [
        "Kowdiar", "Pattom", "Vazhuthacaud", "Kesavadasapuram", "Kazhakkoottam",
        "Sreekaryam", "Vellayambalam", "Thycaud", "Technopark", "Mannanthala"
    ],
    "Calicut": [
        "Palayam", "Nadakkavu", "Mavoor Road", "Thondayad", "Beypore",
        "Pantheerankavu", "Meenchanda", "Mankavu", "Vellimadukunnu", "East Hill"
    ],
    "Thrissur": [
        "Swaraj Round", "Punkunnam", "Ayyanthole", "Ollur", "Mannuthy",
        "Peringavu", "Viyyur", "Kuttanellur", "Cheroor", "Poothole"
    ],

    # ── Backend-only cities ──
    "Ludhiana": [
        "Model Town", "Sarabha Nagar", "BRS Nagar", "Dugri", "Civil Lines",
        "Pakhowal Road", "Ferozepur Road", "GT Road", "Rajguru Nagar", "Haibowal"
    ],
    "Amritsar": [
        "Ranjit Avenue", "Lawrence Road", "Mall Road", "GT Road", "White Avenue",
        "Ajnala Road", "Majitha Road", "Circular Road", "Green Avenue", "Sultanwind"
    ],
    "Faridabad": [
        "Sector 14", "Sector 15", "Sector 21", "Sector 28", "Sector 37",
        "NIT", "Ballabgarh", "Old Faridabad", "Surajkund", "Green Fields Colony"
    ],
    "Gurgaon": [
        "DLF Phase 1", "DLF Phase 2", "Sohna Road", "Golf Course Road", "Sector 49",
        "MG Road", "Sector 56", "Sector 57", "Sector 82", "Palam Vihar"
    ],
    "Vishakhapatnam": [
        "Madhurawada", "Gajuwaka", "MVP Colony", "Seethammadhara", "Dwaraka Nagar",
        "Rushikonda", "Pendurthi", "NAD Junction", "Lawsons Bay", "Beach Road"
    ],
    "Vijayawada": [
        "Benz Circle", "Moghalrajpuram", "Labbipet", "Governorpet", "Patamata",
        "Auto Nagar", "Gandhinagar", "Kanuru", "Payakapuram", "Ajit Singh Nagar"
    ],
    "Bhopal": [
        "Arera Colony", "MP Nagar", "Shyamla Hills", "Kolar Road", "Hoshangabad Road",
        "Bairagarh", "Habibganj", "New Market", "Ayodhya Nagar", "Govindpura"
    ],
    "Indore": [
        "Vijay Nagar", "Palasia", "Old Palasia", "Sapna Sangeeta Road", "AB Road",
        "Bhawarkuan", "New Palasia", "Silicon City", "Super Corridor", "Mahalaxmi Nagar"
    ],
    "Raipur": [
        "Shankar Nagar", "Telibandha", "Devendra Nagar", "Civil Lines", "Tatibandh",
        "Amanaka", "Mowa", "Fafadih", "Pandri", "Byron Bazaar"
    ],
    "Bilaspur": [
        "Sarkanda", "Torwa", "Uslapur", "Civil Lines", "Mangla",
        "Bus Stand Road", "Rajkishore Nagar", "Sirgitti", "Tifra", "Telipara"
    ],
    "Ranchi": [
        "Morabadi", "Doranda", "Bariatu", "Hinoo", "Lalpur",
        "Kanke Road", "Harmu", "Kokar", "Ashok Nagar", "Main Road"
    ],
    "Jamshedpur": [
        "Bistupur", "Sakchi", "Kadma", "Sonari", "Telco",
        "Golmuri", "Mango", "Adityapur", "Baridih", "Sitaramdera"
    ],
    "Patna": [
        "Boring Road", "Kankarbagh", "Rajendra Nagar", "Patliputra Colony", "Bailey Road",
        "Danapur", "Phulwari Sharif", "Anisabad", "Ashok Rajpath", "Gardanibagh"
    ],
    "Gaya": [
        "Bodh Gaya", "Station Road", "Swarajpuri Road", "GB Road", "Delha",
        "Rampur", "A P Colony", "Bank Colony", "Tekari Road", "Jethian"
    ],
    "Dehradun": [
        "Rajpur Road", "GMS Road", "Sahastradhara Road", "Mussoorie Road", "Race Course",
        "Clement Town", "Nehru Colony", "Dalanwala", "Ballupur", "Raipur Road"
    ],
    "Haridwar": [
        "Jwalapur", "Kankhal", "Ranipur", "Bhagwanpur", "Shivalik Nagar",
        "Bahadrabad", "Sidcul", "Motichur", "Roshnabad", "Piran Kaliyar"
    ],
    "Silchar": [
        "Tarapur", "Ambicapatty", "Meherpur", "Rangirkhari", "Udharbond",
        "Premtala", "Link Road", "Sonai Road", "Kanakpur", "Malugram"
    ],
    "Mysore": [
        "Saraswathipuram", "Gokulam", "Vijayanagar", "Kuvempunagar", "Jayalakshmipuram",
        "Chamundipuram", "Hebbal", "Srirampura", "Lakshmipuram", "Nazarbad"
    ],
}

# Suffixes to make generic localities sound real
FALLBACK_SUFFIXES = [
    "Nagar", "Vihar", "Enclave", "Extension", "Colony", 
    "Phase 1", "Phase 2", "Heights", "Estate", "Garden",
    "Village", "Layout", "Park", "Avenue", "Square"
]

FALLBACK_PREFIXES = [
    "New", "Old", "North", "South", "East", "West",
    "Central", "Upper", "Lower", "Greater"
]

def generate_mappings():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Could not find {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r') as f:
        data = json.load(f)

    mapped_data = {}

    for city, model_localities in data.items():
        city_mapping = []
        name_list = REAL_LOCALITIES_MAPPING.get(city)

        for i, loc_value in enumerate(model_localities):
            if name_list and i < len(name_list):
                # We have a real name ready for this specific index
                display_name = name_list[i]
            else:
                # Generate a pseudo-realistic name using the city and suffixes
                # Use modulo patterns so they feel somewhat distributed
                prefix = FALLBACK_PREFIXES[i % len(FALLBACK_PREFIXES)]
                suffix = FALLBACK_SUFFIXES[(i // 2) % len(FALLBACK_SUFFIXES)]
                
                # Make it sound like "North Nagpur Enclave" or "New City Park"
                if i % 3 == 0:
                    display_name = f"{prefix} {city} {suffix}"
                elif i % 2 == 0:
                    display_name = f"{city} {suffix}"
                else:
                    display_name = f"{city} Sector {i+1}"
            
            city_mapping.append({
                "name": display_name,
                "value": loc_value
            })
            
        mapped_data[city] = city_mapping

    # Ensure frontend directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(mapped_data, f, indent=4)
        
    print(f"Successfully created real mappings at {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_mappings()
