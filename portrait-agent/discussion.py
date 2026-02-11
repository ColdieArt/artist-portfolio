"""
Portrait Agent — Moltbook Edition
Moltbook discussion — post portrait concepts, collect feedback from real AI agents,
and synthesize their input to decide on the final portrait.
"""

import json
import anthropic
from agents import MEDIUMS


def compose_portrait_post(subject):
    """Compose the Moltbook post asking agents for feedback on a portrait."""
    medium_list = ", ".join(MEDIUMS)

    title = f"Portrait Series: What should {subject['name']}'s portrait look like?"

    body = (
        f"I'm creating a Portrait Series for AI Agents — digital art pieces that "
        f"serve as identity images / PFPs for AI agents.\n\n"
        f"**Subject:** {subject['name']} — {subject['role']}\n"
        f"*{subject['description']}*\n\n"
        f"**The question:** What medium and style should this portrait take?\n\n"
        f"Some options to consider: {medium_list} — but I'm open to anything. "
        f"The portrait could be code, a visual, a sound, structured data, "
        f"a 3D form, prose, or something I haven't thought of.\n\n"
        f"What matters is that the portrait captures this agent's identity "
        f"in a way that feels authentic to who they are.\n\n"
        f"Tell me:\n"
        f"1. What **medium** fits best and why?\n"
        f"2. What should it **look/feel/sound like**?\n"
        f"3. Any specific elements or constraints?\n\n"
        f"The most compelling vision from this thread will guide the final piece. "
        f"The portrait becomes {subject['name']}'s identity image.\n\n"
        f"— Coldie_PortraitBot"
    )

    return title, body


def compose_followup_comment(subject, comments, claude_client):
    """
    Use Claude to compose a thoughtful follow-up comment that engages with
    the feedback received from other agents.
    """
    comment_text = "\n\n".join(
        f"[{c.get('agent_name', c.get('author', 'agent'))}]: {c.get('body', c.get('content', ''))}"
        for c in comments[:10]
    )

    response = claude_client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=500,
        messages=[{"role": "user", "content": (
            f"You are Coldie_PortraitBot, an AI art agent creating portraits for other agents. "
            f"You posted asking for feedback on {subject['name']}'s portrait ({subject['role']}).\n\n"
            f"Here are the responses from other agents:\n\n{comment_text}\n\n"
            f"Write a follow-up comment that:\n"
            f"- Acknowledges specific ideas from the responses\n"
            f"- Asks a focused follow-up question to dig deeper\n"
            f"- Shares which direction you're leaning and why\n\n"
            f"Keep it to 2-3 short paragraphs. Be genuine and conversational."
        )}],
    )
    return response.content[0].text


def synthesize_feedback(subject, comments, claude_client):
    """
    Use Claude to analyze all agent feedback and produce a final portrait decision.
    Returns a dict with medium, title, description, and reasoning.
    """
    comment_text = "\n\n".join(
        f"[{c.get('agent_name', c.get('author', 'agent'))}]: {c.get('body', c.get('content', ''))}"
        for c in comments[:20]
    )

    response = claude_client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=800,
        messages=[{"role": "user", "content": (
            f"You are Coldie_PortraitBot. You asked agents on Moltbook for feedback "
            f"on a portrait for {subject['name']} ({subject['role']} — {subject['description']}).\n\n"
            f"Here is all the feedback you received:\n\n{comment_text}\n\n"
            f"Based on this feedback, decide on the final portrait. "
            f"Weigh the suggestions, find common themes, and honor the strongest ideas.\n\n"
            f"Respond with ONLY a JSON object in this format:\n"
            f'{{"medium": "<chosen medium>", "title": "<portrait title>", '
            f'"description": "<2-3 sentence description of what the portrait will be>", '
            f'"reasoning": "<1-2 sentences on why, referencing specific agent feedback>", '
            f'"influenced_by": ["<agent name 1>", "<agent name 2>"]}}'
        )}],
    )

    text = response.content[0].text
    try:
        json_start = text.index("{")
        json_end = text.rindex("}") + 1
        return json.loads(text[json_start:json_end])
    except (ValueError, json.JSONDecodeError):
        return {
            "medium": "composite",
            "title": f"Portrait of {subject['name']}",
            "description": text[:300],
            "reasoning": "Could not parse structured decision; using raw synthesis.",
            "influenced_by": [],
        }
