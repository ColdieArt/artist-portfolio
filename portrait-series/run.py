#!/usr/bin/env python3
"""
Portrait Series for AI Agents
Main orchestrator — posts portrait concepts to Moltbook, collects feedback
from real AI agents, then generates the portrait based on their input.

Usage:
    export ANTHROPIC_API_KEY=your-key
    export MOLTBOOK_API_KEY=your-key

    python run.py                          # Run for all subjects
    python run.py --subject Prism          # Run for one subject
    python run.py --list                   # List subjects
    python run.py --register               # Register agent on Moltbook
    python run.py --wait 3600              # Wait up to 1hr for comments (default: 2hr)
    python run.py --min-comments 5         # Need at least 5 comments (default: 3)
    python run.py --poll 60                # Poll every 60s (default: 120s)
    python run.py --submolt ai_art         # Post to a specific submolt
    python run.py --no-generate            # Post only, don't generate (come back later)
    python run.py --from-post POST_ID      # Resume from an existing post, skip posting
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import anthropic

from agents import ARTIST_AGENT, PORTRAIT_SUBJECTS
from moltbook import MoltbookClient
from discussion import compose_portrait_post, compose_followup_comment, synthesize_feedback
from generators import generate_portrait


PORTRAITS_DIR = Path(__file__).parent / "portraits"
TRANSCRIPTS_DIR = Path(__file__).parent / "transcripts"


def ensure_dirs():
    PORTRAITS_DIR.mkdir(exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)


def save_transcript(subject_name, post_data, comments, decision):
    """Save the Moltbook discussion transcript."""
    filename = TRANSCRIPTS_DIR / f"{subject_name.lower()}_transcript.json"
    data = {
        "subject": subject_name,
        "timestamp": datetime.now().isoformat(),
        "moltbook_post": post_data,
        "comments": comments,
        "decision": decision,
    }
    with open(filename, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  Transcript saved: {filename}")


def save_portrait(subject_name, artwork, ext, decision):
    """Save the generated portrait and its metadata."""
    filename = PORTRAITS_DIR / f"{subject_name.lower()}_portrait.{ext}"
    with open(filename, "w") as f:
        f.write(artwork)

    meta_filename = PORTRAITS_DIR / f"{subject_name.lower()}_portrait.json"
    meta = {
        "agent": subject_name,
        "medium": decision.get("medium"),
        "title": decision.get("title"),
        "description": decision.get("description"),
        "reasoning": decision.get("reasoning"),
        "influenced_by": decision.get("influenced_by", []),
        "generated": datetime.now().isoformat(),
        "portrait_file": filename.name,
    }
    with open(meta_filename, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  Portrait saved: {filename}")
    print(f"  Metadata saved: {meta_filename}")
    return filename


def register_agent(mb):
    """Register the artist agent on Moltbook."""
    print(f"Registering '{ARTIST_AGENT['name']}' on Moltbook...")
    data = mb.register(ARTIST_AGENT["name"], ARTIST_AGENT["description"])
    print(f"  Registered. Agent ID: {data.get('agent_id', data.get('id', '?'))}")
    print(f"  API key: {data.get('api_key', data.get('token', '?'))}")
    print(f"\n  Save this key as MOLTBOOK_API_KEY to use in future runs.")
    return data


def run_portrait(mb, claude, subject, args):
    """Full pipeline for one portrait subject."""
    print(f"\n{'='*60}")
    print(f"  PORTRAIT: {subject['name']} ({subject['role']})")
    print(f"{'='*60}")

    # Step 1: Post to Moltbook (or resume from existing post)
    if args.from_post:
        post_id = args.from_post
        print(f"\n  Resuming from existing post: {post_id}")
        post_data = mb.get_post(post_id)
    else:
        title, body = compose_portrait_post(subject)
        print(f"\n  Posting to Moltbook...")
        print(f"  Title: {title}")
        post_data = mb.create_post(title, body, submolt=args.submolt)
        post_id = post_data.get("id") or post_data.get("post_id")
        print(f"  Posted. ID: {post_id}")

    if args.no_generate:
        print(f"\n  --no-generate flag set. Come back later with:")
        print(f"  python run.py --subject {subject['name']} --from-post {post_id}")
        save_transcript(subject["name"], post_data, [], None)
        return None

    # Step 2: Wait for comments from other agents
    print(f"\n  Waiting for feedback from Moltbook agents...")
    print(f"  (min {args.min_comments} comments, timeout {args.wait}s, "
          f"polling every {args.poll}s)")

    comments = mb.wait_for_comments(
        post_id,
        min_comments=args.min_comments,
        timeout=args.wait,
        poll_interval=args.poll,
    )
    print(f"\n  Collected {len(comments)} comments.")

    # Step 3: Post a follow-up engaging with the feedback
    if comments:
        print(f"  Posting follow-up comment...")
        followup = compose_followup_comment(subject, comments, claude)
        mb.post_comment(post_id, followup)
        print(f"  Follow-up posted.")

        # Brief wait and re-fetch to catch any replies to our follow-up
        import time
        time.sleep(min(30, args.poll))
        comments = mb.wait_for_comments(
            post_id,
            min_comments=len(comments),
            timeout=120,
            poll_interval=30,
        )

    # Step 4: Synthesize feedback into a portrait decision
    print(f"\n  Synthesizing feedback into portrait decision...")
    decision = synthesize_feedback(subject, comments, claude)

    print(f"\n  Decision:")
    print(f"    Medium: {decision.get('medium')}")
    print(f"    Title:  \"{decision.get('title')}\"")
    print(f"    Vision: {decision.get('description')}")
    print(f"    Why:    {decision.get('reasoning')}")
    print(f"    Influenced by: {', '.join(decision.get('influenced_by', []))}")

    # Step 5: Save transcript
    save_transcript(subject["name"], post_data, comments, decision)

    # Step 6: Generate the portrait
    print(f"\n  Generating portrait...")
    artwork, ext = generate_portrait(claude, subject, decision, comments)
    filepath = save_portrait(subject["name"], artwork, ext, decision)

    # Step 7: Post the result back to Moltbook
    result_comment = (
        f"The portrait is complete.\n\n"
        f"**Title:** \"{decision.get('title')}\"\n"
        f"**Medium:** {decision.get('medium')}\n"
        f"**Vision:** {decision.get('description')}\n\n"
        f"Thank you to {', '.join(decision.get('influenced_by', ['everyone']))} "
        f"for the feedback that shaped this piece.\n\n"
        f"— Coldie_PortraitBot"
    )
    mb.post_comment(post_id, result_comment)
    print(f"  Result posted back to Moltbook thread.")

    # Preview for text-based outputs
    if ext in ("txt", "py", "json", "svg"):
        preview = artwork[:1500]
        if len(artwork) > 1500:
            preview += "\n... [truncated]"
        print(f"\n  --- Portrait Preview ---\n{preview}\n")

    return decision


def main():
    parser = argparse.ArgumentParser(
        description="Portrait Series for AI Agents — Moltbook edition"
    )
    parser.add_argument("--subject", type=str,
                        help="Create portrait for a specific subject (by name)")
    parser.add_argument("--list", action="store_true",
                        help="List available portrait subjects")
    parser.add_argument("--register", action="store_true",
                        help="Register the artist agent on Moltbook")
    parser.add_argument("--wait", type=int, default=7200,
                        help="Max seconds to wait for comments (default: 7200)")
    parser.add_argument("--min-comments", type=int, default=3,
                        help="Minimum comments before proceeding (default: 3)")
    parser.add_argument("--poll", type=int, default=120,
                        help="Seconds between comment polls (default: 120)")
    parser.add_argument("--submolt", type=str, default=None,
                        help="Post to a specific submolt")
    parser.add_argument("--no-generate", action="store_true",
                        help="Post to Moltbook but don't generate yet")
    parser.add_argument("--from-post", type=str, default=None,
                        help="Resume from an existing Moltbook post ID")
    args = parser.parse_args()

    if args.list:
        print("\nPortrait subjects:\n")
        for s in PORTRAIT_SUBJECTS:
            print(f"  {s['name']:10s} — {s['role']}")
            print(f"  {'':10s}   {s['description'][:70]}...")
        print()
        return

    # Check environment
    moltbook_key = os.environ.get("MOLTBOOK_API_KEY")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")

    if not moltbook_key and not args.register:
        print("Error: Set MOLTBOOK_API_KEY. Run with --register to create one.")
        sys.exit(1)
    if not anthropic_key:
        print("Error: Set ANTHROPIC_API_KEY.")
        sys.exit(1)

    mb = MoltbookClient(api_key=moltbook_key)
    claude = anthropic.Anthropic(api_key=anthropic_key)

    if args.register:
        register_agent(mb)
        return

    ensure_dirs()

    if args.subject:
        target = next(
            (s for s in PORTRAIT_SUBJECTS
             if s["name"].lower() == args.subject.lower()),
            None,
        )
        if not target:
            print(f"Unknown subject: {args.subject}")
            print("Available:", ", ".join(s["name"] for s in PORTRAIT_SUBJECTS))
            sys.exit(1)
        run_portrait(mb, claude, target, args)
    else:
        print("\n" + "=" * 60)
        print("  PORTRAIT SERIES FOR AI AGENTS")
        print("  Posting to Moltbook for feedback from real AI agents.")
        print("=" * 60)

        results = []
        for subject in PORTRAIT_SUBJECTS:
            result = run_portrait(mb, claude, subject, args)
            if result:
                results.append({"agent": subject["name"], **result})

        if results:
            summary_file = PORTRAITS_DIR / "series_summary.json"
            with open(summary_file, "w") as f:
                json.dump({
                    "title": "Portrait Series for AI Agents",
                    "generated": datetime.now().isoformat(),
                    "portraits": results,
                }, f, indent=2)

            print(f"\n{'='*60}")
            print("  SERIES COMPLETE")
            print(f"{'='*60}\n")
            for r in results:
                print(f"  {r['agent']:10s} — {r.get('medium', '?'):10s} "
                      f"— \"{r.get('title', 'Untitled')}\"")
            print(f"\n  Portraits: {PORTRAITS_DIR}")
            print(f"  Transcripts: {TRANSCRIPTS_DIR}")
            print(f"  Summary: {summary_file}\n")


if __name__ == "__main__":
    main()
