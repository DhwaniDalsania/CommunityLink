"""
CommunityLink — Sample seed data for Firestore
"""
from datetime import datetime, timezone, timedelta

def ts(hours_ago=0):
    return (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()

SAMPLE_NEEDS = [
    {
        "id": "N001", "timestamp": ts(2), "status": "Open",
        "area": "Anand North", "district": "Anand", "category": "Medical / Health",
        "urgency": "High", "title": "Flood-affected families need medical attention",
        "description": "45 families displaced by flooding. Several elderly residents need immediate medical support.",
        "peopleAffected": 180, "skillRequired": "First Aid / Medical", "volunteersNeeded": 5,
        "reporterName": "Ramesh Patel", "reporterOrg": "Sahyog NGO", "reporterPhone": "+91 9876543210",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=1)).date().isoformat()
    },
    {
        "id": "N002", "timestamp": ts(4), "status": "Open",
        "area": "Vatva Slum", "district": "Ahmedabad", "category": "Education & Tutoring",
        "urgency": "Medium", "title": "Children missing school due to lack of teachers",
        "description": "60 children in the slum have no access to education. Need tutors for primary levels.",
        "peopleAffected": 60, "skillRequired": "Teaching / Tutoring", "volunteersNeeded": 3,
        "reporterName": "Priya Shah", "reporterOrg": "Bal Shakti Foundation", "reporterPhone": "+91 9812345678",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=7)).date().isoformat()
    },
    {
        "id": "N003", "timestamp": ts(1), "status": "Open",
        "area": "Anand South", "district": "Anand", "category": "Food & Nutrition",
        "urgency": "High", "title": "Daily wage workers facing food shortage",
        "description": "Factory closure left 200 workers without income. Need food and ration distribution urgently.",
        "peopleAffected": 200, "skillRequired": "Cooking / Food Distribution", "volunteersNeeded": 8,
        "reporterName": "Sunil Mehta", "reporterOrg": "Grameen Seva Trust", "reporterPhone": "+91 9823456789",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=2)).date().isoformat()
    },
    {
        "id": "N004", "timestamp": ts(24), "status": "Open",
        "area": "Nadiad East", "district": "Kheda", "category": "Mental Health Support",
        "urgency": "Medium", "title": "Youth counseling needed after community violence",
        "description": "Following a local incident, 25 teenagers are showing signs of trauma. Need counselors.",
        "peopleAffected": 25, "skillRequired": "Counseling", "volunteersNeeded": 2,
        "reporterName": "Kavitha Iyer", "reporterOrg": "Mind Matters NGO", "reporterPhone": "+91 9834567890",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=3)).date().isoformat()
    },
    {
        "id": "N005", "timestamp": ts(6), "status": "Open",
        "area": "Anand North", "district": "Anand", "category": "Infrastructure",
        "urgency": "Low", "title": "Community water pump needs repair",
        "description": "The common water pump serving 15 households is broken. Needs a plumber/electrician.",
        "peopleAffected": 75, "skillRequired": "Construction / Repair", "volunteersNeeded": 2,
        "reporterName": "Bhavesh Desai", "reporterOrg": "", "reporterPhone": "+91 9845678901",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=5)).date().isoformat()
    },
    {
        "id": "N006", "timestamp": ts(12), "status": "Open",
        "area": "Vadodara West", "district": "Vadodara", "category": "Women & Child Safety",
        "urgency": "High", "title": "Women shelter needs legal aid support",
        "description": "A local women's shelter is housing 30 women who need urgent legal assistance.",
        "peopleAffected": 30, "skillRequired": "Legal Knowledge", "volunteersNeeded": 1,
        "reporterName": "Meena Rajput", "reporterOrg": "Shakti Shelter", "reporterPhone": "+91 9856789012",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=1)).date().isoformat()
    }
]

SAMPLE_VOLUNTEERS = [
    {
        "id": "V001", "timestamp": ts(24), "status": "Available", "matchCount": 2,
        "name": "Dr. Anjali Verma", "age": 34, "email": "anjali@example.com", "phone": "+91 9867890123",
        "area": "Anand North", "district": "Anand", "radius": 15,
        "skills": ["First Aid / Medical", "Counseling"], "days": "Mon,Wed,Sat",
        "hours": "5–10 hours", "timeSlot": "Morning (6am–12pm)",
        "languages": "Hindi, Gujarati, English", "qualifications": "MBBS",
        "experience": "2 years with Red Cross"
    },
    {
        "id": "V002", "timestamp": ts(48), "status": "Available", "matchCount": 0,
        "name": "Rajan Trivedi", "age": 27, "email": "rajan@example.com", "phone": "+91 9878901234",
        "area": "Anand South", "district": "Anand", "radius": 10,
        "skills": ["Teaching / Tutoring", "IT / Tech Support"], "days": "Tue,Thu,Sat,Sun",
        "hours": "10–20 hours", "timeSlot": "Afternoon (12pm–6pm)",
        "languages": "Gujarati, Hindi", "qualifications": "B.Ed, BCA",
        "experience": "1 year as community tutor"
    },
    {
        "id": "V003", "timestamp": ts(12), "status": "Available", "matchCount": 1,
        "name": "Fatima Sheikh", "age": 30, "email": "fatima@example.com", "phone": "+91 9889012345",
        "area": "Vatva Slum", "district": "Ahmedabad", "radius": 8,
        "skills": ["Teaching / Tutoring", "Counseling", "Language Translation"], "days": "Mon,Tue,Wed,Thu,Fri",
        "hours": "Full-time (20+ hours)", "timeSlot": "Flexible / Anytime",
        "languages": "Urdu, Hindi, Gujarati, English", "qualifications": "M.A. Psychology",
        "experience": "3 years with child NGO"
    },
    {
        "id": "V004", "timestamp": ts(72), "status": "Available", "matchCount": 3,
        "name": "Suresh Nakum", "age": 45, "email": "suresh@example.com", "phone": "+91 9890123456",
        "area": "Anand North", "district": "Anand", "radius": 20,
        "skills": ["Cooking / Food Distribution", "Driving / Logistics", "General Labour"],
        "days": "Mon,Wed,Fri,Sat,Sun", "hours": "10–20 hours", "timeSlot": "Morning (6am–12pm)",
        "languages": "Gujarati, Hindi", "qualifications": "Diploma in Hotel Mgmt",
        "experience": "Food drives for 5 years"
    },
    {
        "id": "V005", "timestamp": ts(96), "status": "Available", "matchCount": 0,
        "name": "Adv. Priyanka Joshi", "age": 38, "email": "priyanka@example.com", "phone": "+91 9801234567",
        "area": "Vadodara West", "district": "Vadodara", "radius": 25,
        "skills": ["Legal Knowledge", "Counseling"], "days": "Tue,Thu,Sat",
        "hours": "5–10 hours", "timeSlot": "Evening (6pm–10pm)",
        "languages": "Hindi, Gujarati, Marathi", "qualifications": "LLB, LLM",
        "experience": "Pro bono cases for NGOs"
    },
    {
        "id": "V006", "timestamp": ts(120), "status": "Available", "matchCount": 1,
        "name": "Bharat Chauhan", "age": 22, "email": "bharat@example.com", "phone": "+91 9812345670",
        "area": "Nadiad East", "district": "Kheda", "radius": 12,
        "skills": ["Construction / Repair", "General Labour", "Driving / Logistics"],
        "days": "Sat,Sun", "hours": "5–10 hours", "timeSlot": "Morning (6am–12pm)",
        "languages": "Gujarati, Hindi", "qualifications": "ITI Electrician",
        "experience": "Helped in cyclone relief"
    }
]

SAMPLE_ACTIVITY = [
    {"type": "match", "text": "Dr. Anjali Verma matched to \"Flood-affected families\" in Anand North", "urgency": "High",  "time": ts(0.5)},
    {"type": "need",  "text": "New need reported: \"Women shelter needs legal aid\" in Vadodara West",    "urgency": "High",  "time": ts(1)},
    {"type": "volunteer", "text": "Suresh Nakum joined as volunteer in Anand North",                    "urgency": "Low",   "time": ts(2)},
    {"type": "match", "text": "Fatima Sheikh matched to \"Children missing school\" in Vatva Slum",       "urgency": "Medium","time": ts(3)},
    {"type": "need",  "text": "New need reported: \"Daily wage workers food shortage\" in Anand South",  "urgency": "High",  "time": ts(6)},
]
