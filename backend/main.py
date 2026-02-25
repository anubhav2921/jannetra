"""
Predictive Governance Intelligence & Decision Support System
─────────────────────────────────────────────────────────────
FastAPI entry point with startup data seeding and full NLP processing pipeline.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal, Base
from app.models import (
    Source, Article, DetectionResult, GovernanceRiskScore, Alert, SentimentRecord
)
from app.services.mock_data import get_seed_data
from app.services.nlp_service import run_nlp_pipeline
from app.services.fake_news_detector import detect_fake_news
from app.services.gri_service import compute_gri
from app.services.alert_service import generate_alert

from app.routes import dashboard, articles, alerts, analytics, sources, auth, resolutions, map_route, account, leaderboard, chatbot, reports, scanner

app = FastAPI(
    title="Governance Intelligence System",
    description="Predictive Governance Intelligence & Decision Support System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(articles.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(sources.router)
app.include_router(auth.router)
app.include_router(resolutions.router)
app.include_router(map_route.router)
app.include_router(account.router)
app.include_router(leaderboard.router)
app.include_router(chatbot.router)
app.include_router(reports.router)
app.include_router(scanner.router)


@app.on_event("startup")
def seed_database():
    """Create tables and seed with mock data, then run full processing pipeline."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(Article).count() > 0:
            print("[SEED] Database already seeded — skipping.")
            return

        print("[SEED] Seeding database with mock governance data...")
        sources_data, articles_data = get_seed_data()

        # ── Create Sources ──────────────────────────────────────────────
        source_map = {}  # name → Source instance
        for s in sources_data:
            if s["name"] not in source_map:
                source = Source(
                    name=s["name"],
                    source_type=s["source_type"],
                    domain=s["domain"],
                    credibility_tier=s["credibility_tier"],
                    historical_accuracy=s["historical_accuracy"],
                )
                db.add(source)
                db.flush()
                source_map[s["name"]] = source

        # ── Create Articles & Run Pipeline ──────────────────────────────
        for art_data in articles_data:
            source = source_map[art_data["source_name"]]

            article = Article(
                source_id=source.id,
                title=art_data["title"],
                raw_text=art_data["raw_text"],
                category=art_data["category"],
                location=art_data["location"],
                content_hash=art_data["content_hash"],
                ingested_at=art_data["ingested_at"],
            )
            db.add(article)
            db.flush()

            # ── Step 1: NLP Analysis ────────────────────────────────────
            nlp_result = run_nlp_pipeline(art_data["raw_text"])

            sentiment = SentimentRecord(
                article_id=article.id,
                polarity=nlp_result["polarity"],
                subjectivity=nlp_result["subjectivity"],
                anger_rating=nlp_result["anger_rating"],
                sentiment_label=nlp_result["sentiment_label"],
            )
            db.add(sentiment)

            # ── Step 2: Fake News Detection ─────────────────────────────
            detection = detect_fake_news(
                text=art_data["raw_text"],
                source_credibility=source.historical_accuracy,
                source_tier=source.credibility_tier,
                polarity=nlp_result["polarity"],
                subjectivity=nlp_result["subjectivity"],
            )

            det_result = DetectionResult(
                article_id=article.id,
                confidence_score=detection["confidence_score"],
                label=detection["label"],
                features_json=detection["features"],
            )
            db.add(det_result)

            # ── Step 3: GRI Computation ─────────────────────────────────
            gri_result = compute_gri(
                source_credibility=source.historical_accuracy,
                linguistic_manipulation_index=detection["features"]["linguistic_manipulation_index"],
                claims=nlp_result.get("claims", []),
                detection_label=detection["label"],
                ingested_at=art_data["ingested_at"],
                source_type=source.source_type,
                word_count=nlp_result["word_count"],
            )

            gri_record = GovernanceRiskScore(
                article_id=article.id,
                gri_score=gri_result["gri_score"],
                component_scores=gri_result["component_scores"],
                risk_level=gri_result["risk_level"],
            )
            db.add(gri_record)

            # ── Step 4: Alert Generation ────────────────────────────────
            alert_data = generate_alert(
                category=art_data["category"],
                location=art_data["location"],
                gri_score=gri_result["gri_score"],
                anger_rating=nlp_result["anger_rating"],
                is_fake=(detection["label"] == "FAKE"),
            )

            if alert_data:
                alert = Alert(
                    article_id=article.id,
                    severity=alert_data["severity"],
                    department=alert_data["department"],
                    recommendation=alert_data["recommendation"],
                    urgency=alert_data["urgency"],
                    response_strategy=alert_data["response_strategy"],
                )
                db.add(alert)

        db.commit()
        total = db.query(Article).count()
        alerts_count = db.query(Alert).count()
        fake_count = db.query(DetectionResult).filter(
            DetectionResult.label == "FAKE"
        ).count()
        print(f"[SEED] Done! {total} articles, {alerts_count} alerts, {fake_count} flagged as FAKE.")

    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] {e}")
        raise
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "system": "Predictive Governance Intelligence & Decision Support System",
        "version": "1.0.0",
        "endpoints": [
            "/api/dashboard",
            "/api/articles",
            "/api/alerts",
            "/api/analytics/sentiment-trend",
            "/api/analytics/risk-heatmap",
            "/api/analytics/category-breakdown",
            "/api/sources",
            "/docs",
        ],
    }
