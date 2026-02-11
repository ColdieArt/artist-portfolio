"""
Portrait Series for AI Agents
Multi-agent discussion system — agents converse to decide portrait medium and style.
"""

import json
import anthropic
from agents import AGENTS, MEDIUMS


def build_system_prompt(agent, target_agent, phase):
    """Build the system prompt for an agent participating in the discussion."""
    medium_list = ", ".join(MEDIUMS)

    if phase == "propose":
        task = (
            f"You are participating in a collaborative art project: Portrait Series for AI Agents.\n\n"
            f"You are deciding what medium and style the portrait of '{target_agent['name']}' "
            f"({target_agent['role']}) should take.\n\n"
            f"Available mediums include (but are not limited to): {medium_list}.\n"
            f"You can also propose mediums not on this list.\n\n"
            f"Propose a medium and describe your vision for {target_agent['name']}'s portrait. "
            f"Explain WHY this medium fits their identity. Be specific about what it would "
            f"look like, feel like, or behave like.\n\n"
            f"Keep your proposal to 2-3 paragraphs."
        )
    elif phase == "debate":
        task = (
            f"You are continuing the discussion about {target_agent['name']}'s portrait.\n\n"
            f"You've seen proposals from other agents. Respond to them — agree, push back, "
            f"build on ideas, or synthesize. Stay true to your aesthetic values.\n\n"
            f"Keep your response to 2-3 paragraphs."
        )
    elif phase == "decide":
        task = (
            f"The discussion about {target_agent['name']}'s portrait is concluding.\n\n"
            f"Based on the full conversation, state your final recommendation. "
            f"Respond with a JSON block in this exact format, followed by a brief explanation:\n\n"
            f"```json\n"
            f'{{"medium": "<chosen medium>", "title": "<portrait title>", '
            f'"description": "<1-2 sentence description of the portrait>"}}\n'
            f"```\n\n"
            f"Then explain your choice in 1-2 sentences."
        )
    else:
        task = ""

    return f"{agent['personality']}\n\n{task}"


def run_discussion(client, target_agent, all_agents, rounds=2):
    """
    Run a multi-agent discussion about a target agent's portrait.
    Returns the conversation transcript and final decisions.
    """
    transcript = []
    conversation_context = []

    # Other agents discuss (the target agent also participates — they get a say in their own portrait)
    participants = all_agents

    # Phase 1: Initial proposals
    print(f"\n{'='*60}")
    print(f"  PORTRAIT DISCUSSION: {target_agent['name']} ({target_agent['role']})")
    print(f"{'='*60}\n")
    print("--- Phase 1: Proposals ---\n")

    for agent in participants:
        system = build_system_prompt(agent, target_agent, "propose")
        messages = [{"role": "user", "content": (
            f"We're creating a portrait for {target_agent['name']} ({target_agent['role']}). "
            f"What medium should it be, and what should it look like? "
            f"Propose your vision."
        )}]

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=600,
            system=system,
            messages=messages,
        )
        text = response.content[0].text
        entry = {"agent": agent["name"], "phase": "propose", "text": text}
        transcript.append(entry)
        conversation_context.append(f"{agent['name']}: {text}")
        print(f"[{agent['name']}]\n{text}\n")

    # Phase 2: Debate rounds
    for round_num in range(rounds):
        print(f"\n--- Phase 2: Debate (Round {round_num + 1}) ---\n")

        for agent in participants:
            system = build_system_prompt(agent, target_agent, "debate")
            context = "\n\n".join(conversation_context)
            messages = [{"role": "user", "content": (
                f"Here's the discussion so far about {target_agent['name']}'s portrait:\n\n"
                f"{context}\n\n"
                f"What's your response? Build on, challenge, or synthesize the ideas above."
            )}]

            response = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=500,
                system=system,
                messages=messages,
            )
            text = response.content[0].text
            entry = {"agent": agent["name"], "phase": f"debate-{round_num+1}", "text": text}
            transcript.append(entry)
            conversation_context.append(f"{agent['name']}: {text}")
            print(f"[{agent['name']}]\n{text}\n")

    # Phase 3: Final decisions
    print("\n--- Phase 3: Final Decisions ---\n")

    decisions = []
    for agent in participants:
        system = build_system_prompt(agent, target_agent, "decide")
        context = "\n\n".join(conversation_context)
        messages = [{"role": "user", "content": (
            f"Here's the full discussion about {target_agent['name']}'s portrait:\n\n"
            f"{context}\n\n"
            f"Give your final recommendation as a JSON block with medium, title, and description."
        )}]

        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=400,
            system=system,
            messages=messages,
        )
        text = response.content[0].text
        entry = {"agent": agent["name"], "phase": "decide", "text": text}
        transcript.append(entry)
        print(f"[{agent['name']}]\n{text}\n")

        # Try to extract JSON decision
        try:
            json_start = text.index("{")
            json_end = text.index("}") + 1
            decision = json.loads(text[json_start:json_end])
            decision["voted_by"] = agent["name"]
            decisions.append(decision)
        except (ValueError, json.JSONDecodeError):
            decisions.append({
                "medium": "unknown",
                "title": "untitled",
                "description": text[:200],
                "voted_by": agent["name"],
            })

    return transcript, decisions


def tally_decisions(decisions):
    """Find the most popular medium from the agents' decisions."""
    medium_votes = {}
    for d in decisions:
        m = d.get("medium", "unknown").lower().strip()
        medium_votes[m] = medium_votes.get(m, 0) + 1

    winner = max(medium_votes, key=medium_votes.get)
    # Pick the first decision that matches the winning medium for title/description
    winning_decision = next(d for d in decisions if d.get("medium", "").lower().strip() == winner)
    winning_decision["vote_count"] = medium_votes[winner]
    winning_decision["total_votes"] = len(decisions)
    return winning_decision
