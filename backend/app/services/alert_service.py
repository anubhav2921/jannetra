"""
Alert Service — Auto-generates governance alerts based on GRI + fake news + anger.
Maps categories to responsible departments and generates response strategies.
"""

CATEGORY_DEPARTMENT_MAP = {
    "Water": "Water Supply Department",
    "Infrastructure": "Public Works Department",
    "Healthcare": "Health Department",
    "Education": "Education Department",
    "Law & Order": "Police Department",
    "Corruption": "Anti-Corruption Bureau",
    "Transport": "Transport Department",
    "Environment": "Forest Department",
    "Housing": "Urban Development",
    "Sanitation": "Municipal Corporation",
}

RESPONSE_STRATEGIES = {
    "CRITICAL": (
        "Immediate intervention required. Deploy field teams within 2 hours. "
        "Issue public statement acknowledging the problem. Set up a dedicated "
        "helpline. Escalate to district-level leadership for resource allocation."
    ),
    "HIGH": (
        "Prioritize within 24 hours. Assign a task force from the responsible "
        "department. Coordinate with local authorities for ground verification. "
        "Prepare a preliminary action report."
    ),
    "MEDIUM": (
        "Schedule review within 48 hours. Add to department weekly agenda. "
        "Monitor social media sentiment for escalation signals. Prepare "
        "data-backed briefing for decision-makers."
    ),
    "LOW": (
        "Log for tracking. Include in monthly governance review. "
        "No immediate action required but continue monitoring."
    ),
}


def _determine_severity(gri_score: float, anger_rating: float, is_fake: bool) -> str:
    """Determine alert severity from GRI + anger + fake status."""
    if is_fake:
        # Fake news with high reach = critical (misinformation crisis)
        if gri_score > 60:
            return "CRITICAL"
        return "HIGH"

    combined = gri_score * 0.6 + anger_rating * 4  # anger is 0–10 scale
    if combined > 80:
        return "CRITICAL"
    elif combined > 55:
        return "HIGH"
    elif combined > 35:
        return "MEDIUM"
    return "LOW"


def _determine_urgency(severity: str) -> str:
    return {
        "CRITICAL": "IMMEDIATE — respond within 2 hours",
        "HIGH": "URGENT — respond within 24 hours",
        "MEDIUM": "MODERATE — respond within 48 hours",
        "LOW": "ROUTINE — include in next review cycle",
    }.get(severity, "ROUTINE")


def _generate_recommendation(
    category: str, location: str, gri_score: float, is_fake: bool, anger_rating: float
) -> str:
    """Generate a human-readable recommendation."""
    dept = CATEGORY_DEPARTMENT_MAP.get(category, "General Administration")

    if is_fake:
        return (
            f"MISINFORMATION ALERT: Fake news detected about {category.lower()} "
            f"in {location}. {dept} should issue an official clarification. "
            f"Coordinate with social media platforms to flag viral posts. "
            f"GRI Score: {gri_score}/100."
        )

    anger_desc = "extreme" if anger_rating > 7 else "high" if anger_rating > 4 else "moderate"
    return (
        f"Governance concern detected in {category.lower()} sector at {location}. "
        f"Public anger level is {anger_desc} ({anger_rating}/10). "
        f"Assign to {dept} for immediate assessment. "
        f"GRI Score: {gri_score}/100 — proactive response recommended to prevent escalation."
    )


def generate_alert(
    category: str,
    location: str,
    gri_score: float,
    anger_rating: float,
    is_fake: bool,
) -> dict:
    """
    Generate a complete alert payload.
    Only generates for GRI > 30 (anything below is LOW risk, no alert needed).
    Returns None if no alert warranted.
    """
    if gri_score <= 30 and not is_fake:
        return None

    severity = _determine_severity(gri_score, anger_rating, is_fake)
    department = CATEGORY_DEPARTMENT_MAP.get(category, "General Administration")
    urgency = _determine_urgency(severity)
    recommendation = _generate_recommendation(
        category, location, gri_score, is_fake, anger_rating
    )
    response_strategy = RESPONSE_STRATEGIES.get(severity, RESPONSE_STRATEGIES["LOW"])

    return {
        "severity": severity,
        "department": department,
        "recommendation": recommendation,
        "urgency": urgency,
        "response_strategy": response_strategy,
    }
