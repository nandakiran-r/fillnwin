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

# Divisional Offices (Required field)
DIVISIONAL_OFFICES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Vadodara", "Bhopal",
    "Visakhapatnam", "Patna", "Ghaziabad", "Ludhiana", "Coimbatore", "Kochi", "Chandigarh", "Noida"
]

# Retail Outlet Names
RETAIL_OUTLETS = [
    "Bharat Petroleum Outlet A", "HP Petrol Pump - Central", "Indian Oil Station - North",
    "Shell Fuel Station", "Essar Petrol Bunk", "Reliance Petrol Pump", "Nayara Energy Station",
    "BP Fuel Center", "Total Oil Station", "Petronas Outlet", "RO Services Center",
    "Fast Fuel Stop", "Highway Petrol Pump", "City Center Fuel", "Express Fuel Station"
]

# RSA (Regional Sales Area)
RSA_REGIONS = [
    "RSA North", "RSA South", "RSA East", "RSA West", "RSA Central",
    "RSA North-East", "RSA North-West", "RSA South-East", "RSA South-West"
]

# Vehicle Types
VEHICLE_TYPES = ["Car", "Bike", "Truck", "SUV", "Scooter", "Auto", "Bus", "Tempo"]

# State codes for vehicle registration
STATE_CODES = ["KA", "MH", "DL", "TN", "TS", "AP", "WB", "GJ", "RJ", "UP", "MP", "HR", "PB", "KL", "OR"]

def generate_phone():
    """Generate a random Indian phone number"""
    return f"9{random.randint(100000000, 999999999)}"

def generate_vehicle_registration():
    """Generate a random Indian vehicle registration number"""
    state = random.choice(STATE_CODES)
    district = f"{random.randint(1, 99):02d}"
    series = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=2))
    number = random.randint(1000, 9999)
    return f"{state}-{district}-{series}-{number}"

def generate_bill_receipt():
    """Generate a bill receipt number"""
    return f"BR-{random.randint(10000, 99999)}"

def generate_submission_datetime():
    """Generate a random submission date and time within the last 90 days"""
    days_ago = random.randint(0, 90)
    hours = random.randint(8, 20)  # Business hours
    minutes = random.randint(0, 59)
    date = datetime.now() - timedelta(days=days_ago)
    date = date.replace(hour=hours, minute=minutes, second=0, microsecond=0)
    return date.strftime("%Y-%m-%d %H:%M:%S")

def generate_ticket_number(index):
    """Generate a unique ticket number"""
    return f"TKT-{index:05d}"

def generate_participant_data(num_records=10000):
    """
    Generate participant data matching the expected CSV format.
    Required fields: Full Name, Phone, Divisonal Office, Ticket Number
    Optional fields: Bill Receipt, Vehicle Registration Number, Vehicle Type, 
                    SAP Code, Retail Outlet Name, RSA, Submission Date & Time
    """
    participants = []
    
    for i in range(1, num_records + 1):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        
        # Randomly decide whether to include optional fields (80% chance for each)
        include_bill_receipt = random.random() > 0.2
        include_vehicle_reg = random.random() > 0.2
        include_vehicle_type = random.random() > 0.2
        include_sap_code = random.random() > 0.1  # 90% chance to include SAP code
        include_retail_outlet = random.random() > 0.2
        include_rsa = random.random() > 0.2
        include_submission_datetime = random.random() > 0.15  # 85% chance
        
        participant = {
            "Full Name": full_name,
            "Phone": generate_phone(),
            "Bill Receipt": generate_bill_receipt() if include_bill_receipt else "",
            "Vehicle Registration Number": generate_vehicle_registration() if include_vehicle_reg else "",
            "Vehicle Type": random.choice(VEHICLE_TYPES) if include_vehicle_type else "",
            "SAP Code": str(random.choice(SAP_CODES)) if include_sap_code else "",
            "Retail Outlet Name": random.choice(RETAIL_OUTLETS) if include_retail_outlet else "",
            "RSA": random.choice(RSA_REGIONS) if include_rsa else "",
            "Divisonal Office": random.choice(DIVISIONAL_OFFICES),
            "Submission Date & Time": generate_submission_datetime() if include_submission_datetime else "",
            "Ticket Number": generate_ticket_number(i)
        }
        
        participants.append(participant)
    
    return participants

def write_to_csv(participants, filename="participants_10000.csv"):
    """Write participant data to CSV file with exact column headers"""
    if not participants:
        print("No data to write!")
        return
    
    # Exact column headers as expected by csvParser.js
    fieldnames = [
        "Full Name",
        "Phone",
        "Bill Receipt",
        "Vehicle Registration Number",
        "Vehicle Type",
        "SAP Code",
        "Retail Outlet Name",
        "RSA",
        "Divisonal Office",
        "Submission Date & Time",
        "Ticket Number"
    ]
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(participants)
    
    print(f"Successfully generated {len(participants)} records in {filename}")
    
    # Print some statistics
    sap_distribution = {}
    sap_filled_count = 0
    for p in participants:
        sap_code = p['SAP Code']
        if sap_code:
            sap_filled_count += 1
            sap_distribution[sap_code] = sap_distribution.get(sap_code, 0) + 1
    
    print(f"\nStatistics:")
    print(f"- Total records: {len(participants)}")
    print(f"- Records with SAP codes: {sap_filled_count} ({sap_filled_count/len(participants)*100:.1f}%)")
    print(f"- Unique SAP codes used: {len(sap_distribution)}")
    if sap_distribution:
        print(f"- Average records per SAP code: {sap_filled_count / len(sap_distribution):.2f}")
        print(f"- Min records for a SAP code: {min(sap_distribution.values())}")
        print(f"- Max records for a SAP code: {max(sap_distribution.values())}")

if __name__ == "__main__":
    print("Generating 10,000 participant records for FillNWin...")
    print("Format: Full Name, Phone, Bill Receipt, Vehicle Registration Number,")
    print("        Vehicle Type, SAP Code, Retail Outlet Name, RSA,")
    print("        Divisonal Office, Submission Date & Time, Ticket Number\n")
    
    participants = generate_participant_data(10000)
    write_to_csv(participants)
    
    print("\n✓ Done! CSV file created successfully.")
    print("  File: participants_10000.csv")
    print("  Ready to upload to FillNWin dashboard!")
