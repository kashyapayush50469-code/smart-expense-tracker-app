import re

CATEGORY_KEYWORDS = {
    "Food": ["chai", "tea", "coffee", "lunch", "dinner", "breakfast", "food", "restaurant", "snacks", "groceries"],
    "Travel": ["uber", "ola", "petrol", "diesel", "bus", "train", "flight", "taxi", "cab"],
    "Rent": ["rent", "house rent", "fire"],
    "Shopping": ["clothes", "shopping", "amazon", "flipkart"],
    "Entertainment": ["movie", "netflix", "spotify", "game"],
}

def parse_expense_text(text: str):
    text_lower = text.lower()
    
    # Amount nikalo - pehla number jo mile
    amount_match = re.search(r'\d+(\.\d+)?', text)
    amount = float(amount_match.group()) if amount_match else None
    
    # Category guess karo keywords se
    detected_category = None
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                detected_category = category
                break
        if detected_category:
            break
    
    return {
        "amount": amount,
        "category": detected_category,
        "description": text
    }