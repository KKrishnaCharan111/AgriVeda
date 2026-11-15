import os
import httpx
from typing import Dict, Any, Optional
from app.config import settings

# Expert Agronomy Knowledge Base for Indian Agro-Climatic Zones
AGRONOMY_KNOWLEDGE_BASE = [
    {
        "keywords": ["yellow", "yellowing", "pasupu", "pale", "chlorosis", "tomato"],
        "crops": ["tomato", "tamota", "chilli", "mirchi", "cotton", "paddy"],
        "disease_en": "Early Blight or Nitrogen / Iron Deficiency",
        "disease_te": "ముందస్తు తెగులు (Early Blight) లేదా పోషకాల లోపం",
        "confidence": 0.82,
        "severity": "Moderate",
        "causes_en": "Fungal infection (Alternaria solani) often exacerbated by humid weather, or nitrogen/micronutrient deficiency causing chlorosis in older leaves.",
        "causes_te": "వాతావరణంలో తేమ ఎక్కువగా ఉండటం వల్ల ఆల్టర్నేరియా శిలీంధ్రం వ్యాప్తి చెందడం, లేదా నత్రజని లోపం వల్ల ఆకులు పసుపు రంగులోకి మారతాయి.",
        "treatment_en": "1. Remove affected lower leaves to prevent spore splash.\n2. Ensure balanced N-P-K fertilization.\n3. Spray organic Neem Oil (1500 ppm at 5ml/L) or Copper Oxychloride (3g/L) after checking weather forecast.\n4. Avoid overhead sprinkler irrigation in late evenings.",
        "treatment_te": "1. తెగులు సోకిన కింది ఆకులను తుంచి నాశనం చేయండి.\n2. సమతుల్య ఎన్-పి-కె (NPK) ఎరువులను అందించండి.\n3. వేపనూనె (1500 ppm - 5 మి.లీ / లీటరు నీటికి) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా / లీటరు నీటికి) పిచికారీ చేయండి.\n4. సాయంత్రం వేళల్లో తుంపర్ల సాగు నివారించండి.",
        "prevention_en": "Practice crop rotation with non-solanaceous crops. Use certified disease-free seeds and mulch with straw.",
        "prevention_te": "పంట మార్పిడి పద్ధతిని పాటించండి. సర్టిఫైడ్ విత్తనాలను మాత్రమే వాడండి మరియు గడ్డితో మల్చింగ్ చేయండి.",
        "safety_en": "Wear gloves and face mask when spraying. Do not spray during high winds. Keep animals away for 48 hours.",
        "safety_te": "పిచికారీ చేసేటప్పుడు చేతి తొడుగులు మరియు ముఖానికి మాస్క్ ధరించండి. గాలి తీవ్రంగా ఉన్నప్పుడు పిచికారీ చేయవద్దు."
    },
    {
        "keywords": ["curl", "curling", "mudatha", "wrinkled", "twisted", "chilli", "mirchi"],
        "crops": ["chilli", "mirchi", "tomato", "cotton"],
        "disease_en": "Chilli Leaf Curl Virus (Gemini Virus) & Thrips Infestation",
        "disease_te": "మిర్చి ఆకు ముడత తెగులు (జెమిని వైరస్) మరియు తామర పురుగుల ఉధృతి",
        "confidence": 0.88,
        "severity": "High",
        "causes_en": "Transmitted primarily by whiteflies (Bemisia tabaci) and thrips feeding on tender shoots.",
        "causes_te": "తెల్లదోమ మరియు తామర పురుగులు లేత కొమ్మల రసాన్ని పీల్చడం వల్ల ఈ వైరస్ వేగంగా వ్యాపిస్తుంది.",
        "treatment_en": "1. Install yellow and blue sticky traps (10-15 per acre) to monitor and capture vectors.\n2. Spray Neem seed kernel extract (NSKE 5%) or Acetamiprid / Fipronil under expert advice.\n3. Uproot and burn severely stunted virus-infected plants.",
        "treatment_te": "1. ఎకరాకు 10-15 పసుపు, నీలి రంగు జిగురు అట్టలను ఏర్పాటు చేయండి.\n2. వేప గింజల కషాయం (5%) లేదా నిపుణుల సలహాతో అసిటామైప్రిడ్ పిచికారీ చేయండి.\n3. వైరస్ తీవ్రంగా సోకిన మొక్కలను పీకి కాల్చివేయండి.",
        "prevention_en": "Grow border crops like maize, jowar, or bajra around chilli fields to block vector wind drift.",
        "prevention_te": "మిర్చి పొలం చుట్టూ జొన్న లేదా మొక్కజొన్నను రక్షణ పంటగా 2-3 వరుసల్లో వేయండి.",
        "safety_en": "Adhere strictly to recommended waiting periods before harvest. Never exceed dosage.",
        "safety_te": "కోతకు ముందు నిర్దేశించిన నిరీక్షణ సమయాన్ని పాటించండి. మోతాదు మించకూడదు."
    },
    {
        "keywords": ["blast", "aggi thegulu", "spindle", "paddy", "rice", "vari"],
        "crops": ["paddy", "rice", "vari"],
        "disease_en": "Rice Blast Disease (Pyricularia oryzae)",
        "disease_te": "వరి అగ్గి తెగులు (రైస్ బ్లాస్ట్)",
        "confidence": 0.85,
        "severity": "High",
        "causes_en": "Fungal pathogen producing spindle-shaped lesions with brown margins, prevalent during high nitrogen use and cloudy, damp weather.",
        "causes_te": "వాతావరణంలో అధిక తేమ, మబ్బులతో కూడిన వాతావరణం మరియు అధిక నత్రజని వాడకం వల్ల శిలీంధ్రం వ్యాపిస్తుంది.",
        "treatment_en": "1. Temporarily halt urea / nitrogen application.\n2. Maintain thin water layer in fields.\n3. Spray Tricyclazole 75% WP (0.6g/L) or Isoprothiolane 40% EC (1.5ml/L) on initial symptom appearance.",
        "treatment_te": "1. తాత్కాలికంగా యూరియా / నత్రజని వేయడం ఆపండి.\n2. పొలంలో పలుచటి నీటి నిల్వ ఉండేలా చూడండి.\n3. ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా / లీటరు నీటికి) పిచికారీ చేయండి.",
        "prevention_en": "Seed treatment with Carbendazim (2g/kg seed). Select blast-resistant varieties like MTU 1010, BPT 5204 where advised.",
        "prevention_te": "విత్తన శుద్ధి తప్పనిసరిగా కార్బండజిమ్ (2 గ్రా/కిలో) తో చేయండి. తెగులు తట్టుకునే రకాలను ఎంచుకోండి.",
        "safety_en": "Store all agrochemicals out of reach of children and farm animals.",
        "safety_te": "వ్యవసాయ రసాయనాలను పిల్లలు మరియు పెంపుడు జంతువులకు దూరంగా భద్రపరచండి."
    },
    {
        "keywords": ["bollworm", "hole", "larva", "cotton", "prathi", "cheda"],
        "crops": ["cotton", "prathi"],
        "disease_en": "Pink Bollworm / American Bollworm Infestation",
        "disease_te": "పత్తిలో గులాబీ రంగు కాయ తొలుచు పురుగు ఉధృతి",
        "confidence": 0.84,
        "severity": "Critical",
        "causes_en": "Pectinophora gossypiella larvae bore into bolls, eating seeds and staining lint.",
        "causes_te": "గులాబీ రంగు లార్వాలు కాయల్లోకి చొరబడి గింజలను తిని పత్తి దూదిని దెబ్బతీస్తాయి.",
        "treatment_en": "1. Install Pheromone traps (8-10 traps/acre) to track moth emergence.\n2. Release Trichogramma egg parasitoids.\n3. Spray Chlorantraniliprole 18.5% SC (0.3ml/L) or Emamectin Benzoate 5% SG (0.5g/L) if ETL exceeds.",
        "treatment_te": "1. ఎకరాకు 8-10 లింగాకర్షక బుట్టలు (ఫెరమోన్ ట్రాప్స్) అమర్చండి.\n2. ట్రైకోగ్రామా పరాన్నజీవుల గుడ్లను విడుదల చేయండి.\n3. ఆర్థిక నష్ట పరిమితి దాటితే ఎమామెక్టిన్ బెంజోయేట్ (0.5 గ్రా/లీటరు) పిచికారీ చేయండి.",
        "prevention_en": "Avoid extending cotton season into rabi. Shred crop residues immediately after final harvest.",
        "prevention_te": "పంట కాలాన్ని అనవసరంగా పొడిగించవద్దు. చివరి కోత తర్వాత పత్తి మోళ్ళను పీకి నాశనం చేయండి.",
        "safety_en": "Follow proper disposal of chemical containers by puncturing and burying away from water bodies.",
        "safety_te": "ఖాళీ పురుగుమందుల డబ్బాలను నీటి వనరులకు దూరంగా గొయ్యి తీసి పూడ్చివేయండి."
    }
]

DEFAULT_FALLBACK = {
    "disease_en": "General Foliar Stress or Nutrient Imbalance",
    "disease_te": "సాధారణ ఆకుల ఒత్తిడి లేదా పోషకాల అసమతుల్యత",
    "confidence": 0.65,
    "severity": "Moderate",
    "causes_en": "Symptoms indicate potential abiotic stress (temperature variation, moisture stress) or early micro-nutrient imbalance.",
    "causes_te": "లక్షణాలు నీటి ఎద్దడి, అధిక ఉష్ణోగ్రత లేదా సూక్ష్మ పోషకాల లోపం వల్ల సంభవించే సాధారణ ఒత్తిడిని సూచిస్తున్నాయి.",
    "treatment_en": "1. Provide light, timely irrigation without water stagnation.\n2. Apply foliar spray of multi-micronutrient mixture (Grade II at 2-3g/L) or 19:19:19 (5g/L).\n3. Consult your local Agricultural Extension Officer (AEO) or KVK scientist for exact on-field confirmation.",
    "treatment_te": "1. నీరు నిల్వ ఉండకుండా తగినంత తడి అందించండి.\n2. సూక్ష్మ పోషకాల మిశ్రమం (2-3 గ్రా/లీటరు) లేదా 19:19:19 పిచికారీ చేయండి.\n3. ఖచ్చితమైన నిర్ధారణ కోసం స్థానిక వ్యవసాయ అధికారి (AEO) లేదా కృషి విజ్ఞాన కేంద్రాన్ని సంప్రదించండి.",
    "prevention_en": "Conduct regular soil health testing every 2-3 years and incorporate well-decomposed FYM.",
    "prevention_te": "ప్రతి 2-3 సంవత్సరాలకు ఒకసారి నేల పరీక్ష చేయించుకోండి మరియు సేంద్రీయ ఎరువును వాడండి.",
    "safety_en": "Always test any foliar spray on a small test patch before full-field application.",
    "safety_te": "ఏదైనా ద్రవ ఎరువు పిచికారీ చేసే ముందు కొద్ది భాగంలో పరీక్షించి చూడండి."
}

def analyze_crop_issue(
    crop_type: str,
    symptoms: str,
    image_url: Optional[str] = None,
    language: str = "te"
) -> Dict[str, Any]:
    text_corpus = f"{crop_type.lower()} {symptoms.lower()}"
    
    # Match against Agronomy Knowledge Base
    best_match = None
    highest_score = 0
    
    for entry in AGRONOMY_KNOWLEDGE_BASE:
        score = 0
        for kw in entry["keywords"]:
            if kw in text_corpus:
                score += 2
        for cp in entry["crops"]:
            if cp in crop_type.lower():
                score += 3
        if score > highest_score:
            highest_score = score
            best_match = entry

    selected = best_match if highest_score >= 3 else DEFAULT_FALLBACK
    
    return {
        "crop_type": crop_type,
        "image_url": image_url,
        "detected_disease": selected["disease_en"],
        "detected_disease_te": selected["disease_te"],
        "confidence_score": selected["confidence"],
        "severity": selected["severity"],
        "possible_causes": selected["causes_en"],
        "possible_causes_te": selected["causes_te"],
        "treatment_recommendations": selected["treatment_en"],
        "treatment_recommendations_te": selected["treatment_te"],
        "prevention_guide": selected["prevention_en"],
        "prevention_guide_te": selected["prevention_te"],
        "safety_warnings": selected["safety_en"],
        "safety_warnings_te": selected["safety_te"],
        "is_expert_consult_recommended": True,
        "language": language
    }
