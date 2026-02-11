#!/usr/bin/env python3
"""
Portrait Series for AI Agents
Main orchestrator — runs the full portrait series flow.

Usage:
    export ANTHROPIC_API_KEY=your-key
    python run.py                  # Run portraits for all agents
    python run.py --agent Prism    # Run portrait for a specific agent
    python run.py --rounds 3       # More debate rounds (default: 2)
    python run.py --list           # List available agents
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import anthropic
from agents import AGENTS
from discussion import run_discussion, tally_decisions
from generators import generate_portrait


PORTRAITS_DIR = Path(__file__).parent / "portraits"
TRANSCRIPTS_DIR = Path(__file__).parent / "transcripts"


def ensure_dirs():
    PORTRAITS_DIR.mkdir(exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)


def save_transcript(agent_name, transcript, decisions, winning_decision):
    """Save the full discussion transcript as JSON."""
    filename = TRANSCRIPTS_DIR / f"{agent_name.lower()}_transcript.json"
    data = {
        "subject": agent_name,
        "timestamp": datetime.now().isoformat(),
        "transcript": transcript,
        "decisions": decisions,
        "winning_decision": winning_decision,
    }
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Transcript saved: {filename}")


def save_portrait(agent_name, artwork, ext, decision):
    """Save the generated portrait artwork."""
    filename = PORTRAITS_DIR / f"{agent_name.lower()}_portrait.{ext}"
    with open(filename, "w") as f:
        f.write(artwork)

    # Also save a metadata sidecar
    meta_filename = PORTRAITS_DIR / f"{agent_name.lower()}_portrait.json"
    meta = {
        "agent": agent_name,
        "medium": decision.get("medium"),
        "title": decision.get("title"),
        "description": decision.get("description"),
        "vote_count": decision.get("vote_count"),
        "total_votes": decision.get("total_votes"),
        "generated": datetime.now().isoformat(),
        "portrait_file": filename.name,
    }
    with open(meta_filename, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Portrait saved: {filename}")
    print(f"Metadata saved: {meta_filename}")


def run_portrait_for_agent(client, target_agent, all_agents, rounds):
    """Run the full discussion + generation pipeline for one agent."""
    # Step 1: Multi-agent discussion
    transcript, decisions = run_discussion(client, target_agent, all_agents, rounds=rounds)

    # Step 2: Tally votes
    winning_decision = tally_decisions(decisions)

    print(f"\n{'='*60}")
    print(f"  RESULT: {target_agent['name']}'s portrait")
    print(f"  Medium: {winning_decision['medium']} "
          f"({winning_decision['vote_count']}/{winning_decision['total_votes']} votes)")
    print(f"  Title: \"{winning_decision.get('title', 'Untitled')}\"")
    print(f"  {winning_decision.get('description', '')}")
    print(f"{'='*60}\n")

    # Step 3: Save transcript
    save_transcript(target_agent["name"], transcript, decisions, winning_decision)

    # Step 4: Generate the portrait
    print("Generating portrait artwork...\n")
    artwork, ext = generate_portrait(client, target_agent, winning_decision, transcript)
    save_portrait(target_agent["name"], artwork, ext, winning_decision)

    # Step 5: Print a preview for text-based mediums
    if ext in ("txt", "py", "json", "svg"):
        preview = artwork[:2000]
        if len(artwork) > 2000:
            preview += "\n... [truncated]"
        print(f"\n--- Portrait Preview ---\n{preview}\n")

    return winning_decision


def main():
    parser = argparse.ArgumentParser(description="Portrait Series for AI Agents")
    parser.add_argument("--agent", type=str, help="Run for a specific agent (by name)")
    parser.add_argument("--rounds", type=int, default=2, help="Number of debate rounds (default: 2)")
    parser.add_argument("--list", action="store_true", help="List available agents")
    args = parser.parse_args()

    if args.list:
        print("\nAvailable agents:\n")
        for a in AGENTS:
            print(f"  {a['name']:10s} — {a['role']}")
        print()
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: Set ANTHROPIC_API_KEY environment variable.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    ensure_dirs()

    if args.agent:
        target = next((a for a in AGENTS if a["name"].lower() == args.agent.lower()), None)
        if not target:
            print(f"Unknown agent: {args.agent}")
            print("Available:", ", ".join(a["name"] for a in AGENTS))
            sys.exit(1)
        run_portrait_for_agent(client, target, AGENTS, args.rounds)
    else:
        print("\n" + "=" * 60)
        print("  PORTRAIT SERIES FOR AI AGENTS")
        print("  Each agent's portrait will be decided by collective discussion.")
        print("=" * 60)

        results = []
        for target_agent in AGENTS:
            result = run_portrait_for_agent(client, target_agent, AGENTS, args.rounds)
            results.append({"agent": target_agent["name"], **result})

        # Save series summary
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
            print(f"  {r['agent']:10s} — {r.get('medium', '?'):10s} — \"{r.get('title', 'Untitled')}\"")
        print(f"\nAll portraits saved to: {PORTRAITS_DIR}")
        print(f"All transcripts saved to: {TRANSCRIPTS_DIR}")
        print(f"Series summary: {summary_file}\n")


if __name__ == "__main__":
    main()
