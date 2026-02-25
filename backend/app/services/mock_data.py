"""
Mock Data Seeder — Generates ~50 realistic governance articles from diverse sources.
Each article has realistic text, location, category, and source metadata.
"""

import hashlib
import random
from datetime import datetime, timedelta

SOURCES_DATA = [
    {"name": "Times of India", "source_type": "NEWS", "domain": "timesofindia.com", "credibility_tier": "VERIFIED", "historical_accuracy": 0.88},
    {"name": "NDTV", "source_type": "NEWS", "domain": "ndtv.com", "credibility_tier": "VERIFIED", "historical_accuracy": 0.91},
    {"name": "The Hindu", "source_type": "NEWS", "domain": "thehindu.com", "credibility_tier": "VERIFIED", "historical_accuracy": 0.90},
    {"name": "Republic TV", "source_type": "NEWS", "domain": "republicworld.com", "credibility_tier": "UNKNOWN", "historical_accuracy": 0.62},
    {"name": "Twitter Citizen Reports", "source_type": "SOCIAL_MEDIA", "domain": "twitter.com", "credibility_tier": "UNKNOWN", "historical_accuracy": 0.40},
    {"name": "Facebook Community Groups", "source_type": "SOCIAL_MEDIA", "domain": "facebook.com", "credibility_tier": "UNKNOWN", "historical_accuracy": 0.35},
    {"name": "WhatsApp Forwards", "source_type": "SOCIAL_MEDIA", "domain": "whatsapp.com", "credibility_tier": "FLAGGED", "historical_accuracy": 0.15},
    {"name": "Citizen Complaint Portal", "source_type": "COMPLAINT", "domain": "pgportal.gov.in", "credibility_tier": "VERIFIED", "historical_accuracy": 0.85},
    {"name": "CM Helpline", "source_type": "COMPLAINT", "domain": "cmhelpline.gov.in", "credibility_tier": "VERIFIED", "historical_accuracy": 0.82},
    {"name": "Local News Blog", "source_type": "NEWS", "domain": "localnewsblog.in", "credibility_tier": "FLAGGED", "historical_accuracy": 0.28},
]

LOCATIONS = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Jaipur", "Lucknow", "Ahmedabad",
    "Patna", "Bhopal", "Chandigarh", "Varanasi", "Nagpur",
    "Indore", "Surat", "Noida", "Gurgaon", "Ranchi",
]

ARTICLES_DATA = [
    # Water issues
    {"title": "Severe water shortage hits residential areas", "category": "Water",
     "text": "Residents of Sector 12 have been without water supply for 5 consecutive days. The Water Supply Department has failed to respond to multiple complaints. Over 2000 families are affected and have been forced to buy tanker water at exorbitant prices. This is unacceptable negligence by the authorities."},
    {"title": "Contaminated water supply causes mass illness", "category": "Water",
     "text": "SHOCKING! Over 500 people hospitalized after drinking contaminated water from the main pipeline. Health Department confirms E.coli contamination. Residents furious — this is the third incident this year. Municipal Corporation has shown complete incompetence in maintaining water infrastructure."},
    {"title": "Water pipeline repair completed ahead of schedule", "category": "Water",
     "text": "The Public Works Department has successfully completed the repair of the main water pipeline serving 15000 households. The repair was finished 3 days ahead of the projected timeline. Water supply has been fully restored and quality tests confirm safe drinking water standards."},
    {"title": "EXPOSED: Water department officials siphoning funds!", "category": "Water",
     "text": "BREAKING: Sources say officials in the Water Supply Department have allegedly diverted 50 crores meant for pipeline renovation. Unverified documents circulating suggest massive corruption! SHARE THIS before they cover it up!! The common people suffer while bureaucrats loot!!"},
    {"title": "New water treatment plant inaugurated in district", "category": "Water",
     "text": "Chief Minister inaugurated a state-of-the-art water treatment plant with capacity to serve 100000 residents. The plant uses advanced filtration technology and will significantly improve water quality in the region. Investment of 120 crores by the Urban Development department."},

    # Infrastructure
    {"title": "Bridge collapse kills 3 workers at construction site", "category": "Infrastructure",
     "text": "A partially constructed bridge collapsed in the industrial area, killing 3 construction workers and injuring 12 others. The Public Works Department is facing allegations of using substandard materials. This is a disgrace — families have lost their loved ones due to negligence and corruption in public works contracts."},
    {"title": "Major road restoration project shows excellent progress", "category": "Infrastructure",
     "text": "The 45 kilometer national highway restoration project is 80 percent complete and on schedule. The Public Works Department confirmed that modern construction techniques are being used. Commuters have already noticed significant improvement in travel times on completed sections."},
    {"title": "Smart city project delayed by 2 years", "category": "Infrastructure",
     "text": "The ambitious smart city project announced 4 years ago is now delayed by over 2 years. Only 30 percent of planned infrastructure has been completed. Citizens are angry at the waste of 800 crores in taxpayer money with little visible progress. Demand accountability from the Municipal Corporation."},
    {"title": "Secret report reveals ALL bridges in city are UNSAFE!", "category": "Infrastructure",
     "text": "MUST READ! Anonymous insider claims that a secret government report shows EVERY bridge in the city is structurally unsafe!! They don't want you to know this! 100 bridges could collapse at ANY moment!!! WAKE UP people — share this before the government hides the truth!!!"},

    # Healthcare
    {"title": "Government hospital runs out of essential medicines", "category": "Healthcare",
     "text": "Patients at the district government hospital are being turned away due to shortage of essential medicines including antibiotics and painkillers. The Health Department has failed to replenish stocks for over 2 weeks. Poor patients who cannot afford private hospitals are suffering the most. This is a healthcare crisis."},
    {"title": "Free vaccination drive reaches 1 million children", "category": "Healthcare",
     "text": "The Health Department successfully completed its annual vaccination drive, reaching over 1 million children across rural and urban areas. The campaign covered polio, measles, and hepatitis vaccinations. Health workers visited 5000 schools and 800 anganwadi centers."},
    {"title": "Doctors protest over unpaid salaries for 3 months", "category": "Healthcare",
     "text": "Over 200 government doctors went on strike today protesting unpaid salaries for the past 3 months. Hospital services severely affected with only emergency cases being attended. Patients furious at both the government and doctors. The situation is unacceptable and demands immediate resolution."},
    {"title": "SHOCKING: Vaccines being made from POISON! Government coverup!", "category": "Healthcare",
     "text": "EXPOSED! Sources say the vaccines being given to children contain dangerous chemicals that cause permanent damage!! The government is hiding this information! Multiple children have reportedly died but media is SILENT!!! SPREAD THE WORD — save your children!!!"},

    # Law & Order
    {"title": "Crime rate spikes 40% in residential neighborhoods", "category": "Law & Order",
     "text": "Police statistics reveal a 40 percent increase in burglaries and street crime in residential areas over the past 3 months. Residents complain of inadequate police patrolling. Women feel unsafe walking alone even during daytime. The Police Department must deploy more personnel and improve surveillance immediately."},
    {"title": "New CCTV surveillance system reduces crime by 25%", "category": "Law & Order",
     "text": "The newly installed AI-powered CCTV surveillance system covering major intersections and public spaces has contributed to a 25 percent reduction in street crime. The Police Department reported 150 arrests facilitated by the camera network in just 3 months. The system cost 40 crores and has proven its value."},
    {"title": "Police brutality during peaceful protest draws outrage", "category": "Law & Order",
     "text": "Furious citizens condemn the police for using excessive force against peaceful protesters demanding clean water. Video footage shows lathi charges against women and elderly protesters. This is outrageous and shameful behavior by law enforcement. Multiple human rights organizations have demanded an independent inquiry."},

    # Corruption
    {"title": "Land acquisition scam worth 200 crores exposed", "category": "Corruption",
     "text": "Anti-Corruption Bureau has uncovered a massive land acquisition scam involving senior government officials and private builders. According to investigators, public land worth approximately 200 crores was illegally transferred using forged documents. Three officials have been arrested and more arrests are expected."},
    {"title": "Whistleblower reveals systematic bribery in permits", "category": "Corruption",
     "text": "A government employee turned whistleblower has exposed a systematic bribery network in the building permits department. Every permit allegedly requires a bribe of 10 to 50 thousand rupees. The corruption has been ongoing for years and involves officials at multiple levels. Citizens demand immediate action."},
    {"title": "ALL politicians exposed in MEGA corruption scandal!!!", "category": "Corruption",
     "text": "BREAKING EXCLUSIVE! A leaked document reportedly exposes EVERY major politician in a 10000 crore corruption scandal!! Sources say this goes all the way to the top!! The mainstream media won't cover this — you won't believe what they're hiding!!! SHARE before this gets DELETED!!!"},

    # Education
    {"title": "Government school lacks basic facilities", "category": "Education",
     "text": "A government primary school with 400 students has been operating without proper toilets, drinking water, and electricity for 6 months. Parents are angry at the Education Department for ignoring their repeated complaints. Children are suffering and many have stopped attending school due to unhygienic conditions."},
    {"title": "Digital education initiative reaches 10000 rural schools", "category": "Education",
     "text": "The state Education Department has successfully deployed digital learning tools including tablets and smart boards to 10000 rural schools. The initiative, funded by a public-private partnership, has improved student engagement by 35 percent according to initial assessments."},
    {"title": "Teacher shortage crisis in government schools", "category": "Education",
     "text": "Over 5000 teaching positions remain vacant across government schools in the state. Many schools operate with just 1 or 2 teachers for all grades. The Education Department has failed to conduct recruitment for over 2 years. Students in rural areas are the worst affected by this negligence and incompetence."},

    # Additional realistic articles
    {"title": "Public transport system faces major breakdown", "category": "Infrastructure",
     "text": "The city bus fleet is in shambles with 60 percent of buses non-operational due to poor maintenance. Commuters face hours of waiting and overcrowded conditions. The Transport Department has been requesting new buses for 3 years but the budget has not been allocated. Working class citizens suffer daily."},
    {"title": "Dengue outbreak spreads across 5 districts", "category": "Healthcare",
     "text": "The Health Department confirmed a dengue outbreak affecting 5 districts with over 3000 confirmed cases and 12 deaths. Fogging operations have been delayed due to lack of supplies. Hospitals are overwhelmed and patients are being turned away. This crisis was completely preventable with timely action."},
    {"title": "Illegal sand mining destroying riverbanks", "category": "Environment",
     "text": "Despite multiple court orders, illegal sand mining continues unchecked along major rivers. The mining mafia operates with alleged police protection. Riverbanks are eroding, threatening nearby villages. Environmental activists who raised complaints have reportedly received threats. The authorities show complete disregard for ecological damage."},
    {"title": "Youth employment program creates 50000 jobs", "category": "Education",
     "text": "The state government's skill development and employment program has successfully placed 50000 youth in private sector jobs over the past year. The program provides 6-month training in IT, manufacturing, and service sectors. Participants come from economically weaker sections and the program has received national recognition."},
    {"title": "Flood warning system fails during monsoon emergency", "category": "Infrastructure",
     "text": "The early warning system installed 2 years ago at a cost of 15 crores completely failed during the recent monsoon emergency, leaving 20000 residents stranded without advance notice. The system was reportedly never properly tested after installation. This failure is criminal negligence that endangered thousands of lives."},

    # More social media / complaint style
    {"title": "No streetlights in area for 2 months, women feel unsafe", "category": "Law & Order",
     "text": "Complaint: All streetlights in Ward 14 have been non-functional for the past 2 months. Despite 3 complaints to the Electricity Board and Municipal Corporation, no action has been taken. Women and elderly residents feel extremely unsafe after dark. We demand immediate repair and accountability for this negligence."},
    {"title": "Raw sewage flooding streets in monsoon", "category": "Water",
     "text": "Every monsoon the same problem! Raw sewage is flooding our streets because the drainage system has not been cleaned in over a year. Children are getting sick from playing near contaminated water. The Municipal Corporation collects taxes but provides ZERO services. Completely pathetic governance."},
    {"title": "Hospital staff rude and corrupt, demanding bribes", "category": "Corruption",
     "text": "Just visited the government hospital with my mother and was told we need to pay 2000 rupees extra for a bed that should be free. The staff is openly demanding bribes. When I refused, they made us wait 6 hours. This is harassment of common citizens. The Health Department must investigate."},
    {"title": "New park and recreation center opened for community", "category": "Infrastructure",
     "text": "The Municipal Corporation inaugurated a beautiful new community park and recreation center. The facility includes a children's playground, walking tracks, open gym equipment, and a community hall. The project was completed within budget and is now open for all residents free of charge."},
    {"title": "Electricity bills doubled without explanation", "category": "Infrastructure",
     "text": "Thousands of residents received electricity bills that are double the usual amount this month. The Electricity Board has provided no explanation and their helpline is unreachable. This is causing significant financial distress especially for low-income families. We demand transparency and fair billing practices."},

    # More fake news style
    {"title": "Government planning to DEMOLISH 10000 homes secretly!", "category": "Housing",
     "text": "ALERT! Insider information reveals the government has a SECRET plan to demolish 10000 homes in the name of development!! They won't give any compensation!! This plan is being finalized RIGHT NOW behind closed doors!! Share with everyone you know — save your homes before it's too late!!!"},
    {"title": "Foreign companies TAKING OVER all government hospitals!", "category": "Healthcare",
     "text": "BREAKING! Reportedly, the government has secretly signed deals to hand over ALL government hospitals to foreign private companies!! Free healthcare will END completely!! Sources say this will happen in just 2 weeks!! The media is hiding this — SHARE NOW!!!"},

    # Balanced / positive
    {"title": "Solar power initiative reduces electricity costs by 30%", "category": "Infrastructure",
     "text": "The state's rooftop solar power initiative has been a remarkable success. Over 25000 households now have solar panels installed with government subsidy. Average electricity bills have reduced by 30 percent. The Electricity Board confirmed the program will be expanded to cover 100000 more households next year."},
    {"title": "Anti-corruption hotline receives 5000 actionable complaints", "category": "Corruption",
     "text": "The newly launched anonymous anti-corruption hotline has received over 5000 complaints in its first 6 months, of which 800 have been investigated and 120 officials have been disciplined. The Anti-Corruption Bureau stated that the hotline has been instrumental in identifying corruption patterns across departments."},
    {"title": "Community policing program improves trust between police and citizens", "category": "Law & Order",
     "text": "The community policing program launched by the Police Department has significantly improved police-citizen relations. Beat officers now visit neighborhoods weekly, hold open meetings, and respond to non-emergency complaints within 48 hours. Surveys show a 45 percent improvement in public trust in local police."},
    {"title": "Rural health centers upgraded with modern equipment", "category": "Healthcare",
     "text": "The Health Department completed the upgrade of 200 primary health centers in rural areas, equipping them with digital diagnostics, teleconsultation facilities, and essential medicine inventories. The upgrade is expected to benefit 5 million rural residents who previously had to travel to district hospitals for basic care."},

    # Additional complaint-style
    {"title": "Garbage not collected for 10 days in multiple wards", "category": "Sanitation",
     "text": "Garbage collection has completely stopped in Wards 7, 8, and 12 for the past 10 days. The stench is unbearable and there is risk of disease outbreak. Stray dogs and rats are spreading waste everywhere. The Municipal Corporation sanitation workers have gone on an unauthorized strike and no alternative arrangement has been made."},
    {"title": "Dangerous potholes causing daily road accidents", "category": "Infrastructure",
     "text": "The main highway connecting the city to the airport has massive potholes that have caused 15 accidents in just 2 weeks, including 2 deaths. The Public Works Department marked these for repair 6 months ago but nothing has been done. This is killing people — literally. When will the authorities act?"},
    {"title": "School building roof collapsed during classes", "category": "Education",
     "text": "The roof of a government school building partially collapsed during classes, injuring 8 students. The building was flagged as unsafe 2 years ago but the Education Department never approved renovation funds. This is criminal negligence. Parents are furious and demanding the arrest of responsible officials."},

    # More balanced coverage
    {"title": "Traffic management system upgrade reduces congestion", "category": "Infrastructure",
     "text": "The city's new AI-based traffic management system has reduced average commute times by 20 percent at major intersections. The Transport Department installed adaptive traffic signals at 150 junctions that respond to real-time traffic flow. The 60 crore project was implemented in partnership with a tech company."},
    {"title": "Groundwater conservation effort shows positive results", "category": "Water",
     "text": "The district's rainwater harvesting and groundwater recharge program has resulted in a 15 percent improvement in groundwater levels according to the Central Ground Water Board. The Water Supply Department credits the construction of 500 recharge wells and community awareness campaigns for the success."},
    {"title": "Women safety app receives positive response in city", "category": "Law & Order",
     "text": "The Police Department's new women safety app has been downloaded by over 200000 users in its first month. The app features SOS alerts, live location sharing with police control room, and nearest safe point navigation. Response time to distress calls through the app averages 8 minutes."},
]


def get_seed_data() -> tuple:
    """Return (sources_list, articles_list) for database seeding."""
    articles = []
    for i, art in enumerate(ARTICLES_DATA):
        source = random.choice(SOURCES_DATA)
        location = random.choice(LOCATIONS)
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        ingested_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)

        content_hash = hashlib.sha256(
            (art["text"] + str(i)).encode()
        ).hexdigest()

        articles.append({
            "source_name": source["name"],
            "source_data": source,
            "title": art["title"],
            "raw_text": art["text"],
            "category": art["category"],
            "location": location,
            "content_hash": content_hash,
            "ingested_at": ingested_at,
        })

    return SOURCES_DATA, articles
