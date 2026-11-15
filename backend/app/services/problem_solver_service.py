from typing import Dict, Any, Optional

# Knowledge dictionary mapping Telugu & English farmer queries to practical solutions
PROBLEM_SOLVER_KB = [
    {
        "patterns": ["tomato", "tamota", "pasupu", "yellow", "aakulu"],
        "topic": "Crop Health",
        "answer_en": "In tomato crops, yellowing of lower leaves is often caused by Early Blight (Alternaria) or Nitrogen deficiency. Recommended steps: 1. Snip off lower yellow infected leaves. 2. Ensure balanced water supply without waterlogging. 3. Spray organic Neem Oil (5ml/L) or Copper Oxychloride (3g/L) on clear sunny days.",
        "answer_te": "టమాటా పంటలో అడుగు ఆకులు పసుపు రంగులోకి మారడం ముందస్తు తెగులు లేదా నత్రజని లోపం వల్ల జరుగుతుంది. నివారణ చర్యలు: 1. పసుపు రంగులోకి మారిన అడుగు ఆకులను తుంచి నాశనం చేయండి. 2. పొలంలో నీరు నిల్వ ఉండకుండా చూడండి. 3. వేపనూనె (5 మి.లీ / లీటరు నీటికి) లేదా కాపర్ ఆక్సిక్లోరైడ్ (3 గ్రా / లీటరు నీటికి) పిచికారీ చేయండి."
    },
    {
        "patterns": ["mirchi", "chilli", "mudatha", "curl", "leaf curl", "thrips"],
        "topic": "Pest & Disease",
        "answer_en": "Chilli leaf curling is caused by sucking pests like thrips and whiteflies transmitting leaf curl virus. Recommended steps: 1. Erect yellow and blue sticky traps (15 per acre). 2. Spray Neem Seed Kernel Extract (NSKE 5%) or Fipronil (2ml/L) in early morning or evening. 3. Remove severely stunted infected plants.",
        "answer_te": "మిరప పంటలో ఆకు ముడత తామర పురుగులు మరియు తెల్లదోమల వల్ల వస్తుంది. నివారణ చర్యలు: 1. ఎకరాకు 15 పసుపు, నీలి రంగు జిగురు అట్టలు అమర్చండి. 2. వేపగింజల కషాయం 5% లేదా ఫిప్రోనిల్ (2 మి.లీ / లీటరు) పిచికారీ చేయండి. 3. తీవ్రంగా ముడత పడిన మొక్కలను పీకివేయండి."
    },
    {
        "patterns": ["vari", "paddy", "rice", "aggi thegulu", "blast", "blight"],
        "topic": "Crop Health",
        "answer_en": "Blast disease in paddy produces spindle-shaped lesions on leaves and neck rot. Recommended steps: 1. Stop urea application temporarily. 2. Maintain a shallow layer of water in the field. 3. Spray Tricyclazole 75% WP at 0.6g per liter of water.",
        "answer_te": "వరి పంటలో అగ్గి తెగులు నివారణకు: 1. యూరియా వేయడం వెంటనే ఆపండి. 2. పొలంలో పలుచగా నీరు ఉండేలా చూడండి. 3. ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా / లీటరు నీటికి) కలిపి పిచికారీ చేయండి."
    },
    {
        "patterns": ["cotton", "prathi", "gulabi", "bollworm", "puvvu", "kaya"],
        "topic": "Pest Management",
        "answer_en": "Pink bollworm in cotton damages flower rosettes and bolls. Recommended steps: 1. Install 8-10 pheromone traps per acre to detect moth emergence. 2. Release Trichogramma parasitoids. 3. If infestation is above ETL, spray Emamectin Benzoate 5% SG (0.5g/L).",
        "answer_te": "పత్తిలో గులాబీ రంగు కాయ తొలుచు పురుగు నివారణకు: 1. ఎకరాకు 8-10 లింగాకర్షక బుట్టలు (ట్రాప్స్) పెట్టండి. 2. ట్రైకోగ్రామా కార్డులను అమర్చండి. 3. ఉధృతి ఎక్కువగా ఉంటే ఎమామెక్టిన్ బెంజోయేట్ 5% SG (0.5 గ్రా / లీటరు నీటికి) పిచికారీ చేయండి."
    },
    {
        "patterns": ["water", "neeru", "irrigation", "tadi", "bore"],
        "topic": "Water Management",
        "answer_en": "Irrigation guidance: Water crops during early morning or evening to reduce evaporation loss by 30%. For black soils, maintain 4-6 days interval; for red sandy soils, irrigate every 2-3 days using furrow or drip irrigation.",
        "answer_te": "నీటి యాజమాన్యం: ఎండ తీవ్రత లేని ఉదయం లేదా సాయంత్రం వేళల్లోనే నీరు పెట్టండి, దీనివల్ల 30% నీరు ఆవిరి కాకుండా ఆదా అవుతుంది. నల్లరేగడి నేలల్లో 4-6 రోజులకు, ఎర్ర నేలల్లో 2-3 రోజులకు ఒకసారి తేమను బట్టి తడులు ఇవ్వండి."
    },
    {
        "patterns": ["fertilizer", "eruvulu", "urea", "dap", "potash"],
        "topic": "Nutrient Management",
        "answer_en": "Fertilizer best practice: Avoid excessive single doses of urea. Split nitrogen into 3 equal applications (basal, tillering/vegetative, and flowering). Apply phosphatic fertilizers only as basal dose close to root zone.",
        "answer_te": "ఎరువుల యాజమాన్యం: యూరియాను ఒకేసారి ఎక్కువగా వేయకూడదు. నత్రజనిని మూడు సమభాగాలుగా చేసి (విత్తేటప్పుడు, శాఖీయ దశలో, పూత దశలో) వేయండి. భాస్వరం ఎరువులను దుక్కిలోనే వేయడం మంచిది."
    },
    {
        "patterns": ["scheme", "subsidies", "subsidy", "pm kisan", "rythu bharosa"],
        "topic": "Government Schemes",
        "answer_en": "You can check PM-KISAN, Rythu Bharosa, and Subsidized drip irrigation in the Government Schemes section of AgriVeda. For PM-KISAN, ensure your bank account is Aadhaar-seeded and e-KYC is completed.",
        "answer_te": "ప్రభుత్వ పథకాలు: అగ్రివేద యాప్‌లోని ప్రభుత్వ పథకాల విభాగంలో పిఎం-కిసాన్, రైతు భరోసా, సబ్సిడీ డ్రిప్ పరికరాల వివరాలు చూడవచ్చు. పిఎం-కిసాన్ కోసం బ్యాంక్ ఖాతాకు ఆధార్ లింక్ మరియు ఇ-కెవైసి పూర్తి చేసుకుని ఉండాలి."
    }
]

GENERAL_GUIDANCE = {
    "topic": "General Farming Advice",
    "answer_en": "Thank you for asking AgriVeda. For this specific farming question, we recommend observing the crop closely for discoloration, pests, or wilting. You can also upload a photo in Crop Doctor or request a direct callback from an agricultural expert through the app.",
    "answer_te": "అగ్రివేదను సంప్రదించినందుకు ధన్యవాదాలు. మీ పంట సమస్యకు సంబంధించి ఆకుల రంగు, పురుగుల ఉనికిని గమనించండి. మరింత ఖచ్చితమైన పరిష్కారం కోసం క్రాప్ డాక్టర్‌లో ఫోటోను అప్‌లోడ్ చేయవచ్చు లేదా యాప్ ద్వారా వ్యవసాయ నిపుణుడి సలహా కోసం అభ్యర్థించవచ్చు."
}

def solve_farmer_query(
    question_text: str,
    topic: Optional[str] = None
) -> Dict[str, Any]:
    q_lower = question_text.lower()
    
    # Detect language: if Telugu Unicode characters exist or common Telugu phonetic words are present
    has_telugu_unicode = any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in question_text)
    telugu_phonetic_markers = ["naaku", "pantalo", "aakulu", "em cheyyali", "thegulu", "eruvulu", "neeru", "mariyu"]
    is_telugu = has_telugu_unicode or any(marker in q_lower for marker in telugu_phonetic_markers)
    lang = "te" if is_telugu else "en"
    
    # Match query against KB
    best_match = None
    max_hits = 0
    for item in PROBLEM_SOLVER_KB:
        hits = sum(1 for pattern in item["patterns"] if pattern in q_lower)
        if hits > max_hits:
            max_hits = hits
            best_match = item
            
    if best_match and max_hits >= 1:
        chosen = best_match
    else:
        chosen = GENERAL_GUIDANCE

    return {
        "question_text": question_text,
        "detected_language": lang,
        "topic": chosen["topic"],
        "answer_text_en": chosen["answer_en"],
        "answer_text_te": chosen["answer_te"]
    }
