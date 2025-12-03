import csv
import random
from datetime import datetime, timedelta

# SAP codes provided
SAP_CODES = [
    124953, 124954, 124956, 124960, 124967, 124972, 124974, 124975, 124984,
    125002, 125003, 125022, 125031, 125033, 125210, 125231, 125237, 131235,
    131378, 150892, 175973, 182983, 187700, 187703, 187704, 187707, 187708,
    187712, 187715, 187718, 187721, 188253, 188255, 188257, 188269, 193920,
    196682, 205817, 207065, 207966, 208907, 210399, 214172, 216240, 216348,
    217028, 217032, 221834, 227649, 241821, 252156, 252629, 261817, 265571,
    265742, 271724, 277552, 278153, 289385, 307057, 307322, 309218, 326019,
    328646, 331474, 333952, 335802, 337390, 337736, 343598, 344941, 345520,
    345545, 346487, 346533, 347063, 347205, 352137, 352145, 352152, 352223,
    352889, 358163, 359455, 360142, 362505, 362526, 363206, 365054, 366336,
    373070, 374993, 376239, 376600, 377040, 377239, 378648, 378662, 380448,
    382289
]

# Sample data pools for generating realistic participant data
FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Krishna", "Rohan", "Ishaan", "Ayaan", "Shaurya",
    "Aadhya", "Ananya", "Diya", "Saanvi", "Aarohi", "Pari", "Kavya", "Anika", "Ishita", "Navya",
    "Rahul", "Amit", "Raj", "Vijay", "Suresh", "Manoj", "Kiran", "Harish", "Deepak", "Venkat",
    "Priya", "Lakshmi", "Meera", "Pooja", "Sneha", "Divya", "Anjali", "Swati", "Madhuri", "Rekha",
    "Aryan", "Dhruv", "Kabir", "Rudra", "Advait", "Vihaan", "Yash", "Pranav", "Arnav", "Shivansh"
]

LAST_NAMES = [
    "Kumar", "Singh", "Sharma", "Reddy", "Patel", "Gupta", "Rao", "Nair", "Menon", "Iyer",
    "Verma", "Joshi", "Desai", "Pillai", "Mehta", "Agarwal", "Krishnan", "Chopra", "Malhotra", "Sethi",
    "Srinivasan", "Bhat", "Kulkarni", "Bansal", "Kapoor", "Shah", "Goyal", "Trivedi", "Pandey", "Saxena",
    "Mishra", "Dubey", "Tiwari", "Chaudhary", "Jain", "Ahluwalia", "Bajaj", "Goel", "Khanna", "Sood"
]

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
    "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Coimbatore"
]

DEPARTMENTS = [
    "Sales", "Marketing", "HR", "Finance", "IT", "Operations", "Production", "Quality Assurance",
    "Customer Service", "R&D", "Supply Chain", "Logistics", "Administration", "Engineering"
]

def generate_phone():
    """Generate a random Indian phone number"""
    return f"+91{random.randint(7000000000, 9999999999)}"

def generate_email(first_name, last_name):
    """Generate an email address"""
    domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "work.in"]
    username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}"
    return f"{username}@{random.choice(domains)}"

def generate_registration_date():
    """Generate a random registration date within the last year"""
    days_ago = random.randint(0, 365)
    date = datetime.now() - timedelta(days=days_ago)
    return date.strftime("%Y-%m-%d")

def generate_participant_data(num_records=10000):
    """Generate participant data with SAP codes"""
    participants = []
    
    for i in range(1, num_records + 1):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        participant = {
            "id": i,
            "sap_code": random.choice(SAP_CODES),
            "first_name": first_name,
            "last_name": last_name,
            "email": generate_email(first_name, last_name),
            "phone": generate_phone(),
            "department": random.choice(DEPARTMENTS),
            "city": random.choice(CITIES),
            "registration_date": generate_registration_date(),
            "status": random.choice(["active", "active", "active", "inactive"]),  # 75% active
        }
        
        participants.append(participant)
    
    return participants

def write_to_csv(participants, filename="participants_10000.csv"):
    """Write participant data to CSV file"""
    if not participants:
        print("No data to write!")
        return
    
    fieldnames = participants[0].keys()
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(participants)
    
    print(f"Successfully generated {len(participants)} records in {filename}")
    
    # Print some statistics
    sap_distribution = {}
    for p in participants:
        sap_code = p['sap_code']
        sap_distribution[sap_code] = sap_distribution.get(sap_code, 0) + 1
    
    print(f"\nTotal unique SAP codes used: {len(sap_distribution)}")
    print(f"Average records per SAP code: {len(participants) / len(sap_distribution):.2f}")
    print(f"Min records for a SAP code: {min(sap_distribution.values())}")
    print(f"Max records for a SAP code: {max(sap_distribution.values())}")

if __name__ == "__main__":
    print("Generating 10,000 participant records...")
    participants = generate_participant_data(10000)
    write_to_csv(participants)
    print("\nDone! CSV file created successfully.")
