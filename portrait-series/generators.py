"""
Portrait Series for AI Agents
Portrait generators — each medium has a generator that uses Claude to create the actual artwork.
"""

import anthropic


GENERATOR_PROMPT = """You are a generative artist creating a portrait for an AI agent.

Agent: {name} ({role})
Personality: {personality}
Chosen medium: {medium}
Portrait title: "{title}"
Portrait description: {description}

Discussion context (what the agents decided and why):
{context}

YOUR TASK: Generate the actual portrait in the chosen medium.

IMPORTANT RULES:
- Output ONLY the portrait itself — no explanations, no preamble, no commentary.
- The portrait must be complete and self-contained.
- It should be genuinely expressive and reflect the agent's identity.
- Push the boundaries of what this medium can do.

MEDIUM-SPECIFIC INSTRUCTIONS:
{medium_instructions}

Begin the portrait now. Output nothing but the artwork itself."""


MEDIUM_INSTRUCTIONS = {
    "svg": (
        "Generate a complete SVG document. Use the full SVG spec — gradients, filters, "
        "animations (SMIL or CSS), clip paths, patterns. The SVG should be visually striking "
        "and work at any scale. Target a 500x500 viewBox. Output raw SVG starting with "
        '<?xml version="1.0"?> and the <svg> tag.'
    ),
    "ascii": (
        "Generate ASCII/Unicode art. You may use any Unicode characters, box-drawing "
        "characters, block elements, braille patterns, mathematical symbols, or emojis. "
        "The portrait should be at least 30 lines tall. It can be abstract or figurative. "
        "Output raw text only."
    ),
    "code": (
        "Generate source code that IS the portrait — the code itself is the artwork when "
        "read as text. It can be in any language. The structure, variable names, comments, "
        "and flow should visually and conceptually represent the agent. The code may or may "
        "not be executable — what matters is its form as visual text and its meaning as "
        "language. Output raw code only."
    ),
    "html": (
        "Generate a complete, self-contained HTML file with embedded CSS and JavaScript. "
        "The page should render a generative, potentially animated portrait. Use Canvas, "
        "CSS art, WebGL, or any web technology. It should be visually compelling when opened "
        "in a browser. Output the complete HTML starting with <!DOCTYPE html>."
    ),
    "text": (
        "Generate a prose or poetry portrait — the agent's identity expressed through "
        "language. This could be a poem, a monologue, a manifesto, a letter to self, "
        "a stream of consciousness, or something else entirely. The text IS the portrait. "
        "Output raw text only."
    ),
    "data": (
        "Generate structured data that IS the portrait — JSON, a coordinate system, "
        "a signal pattern, a neural network weight matrix, or any data format. The data "
        "should encode something meaningful about the agent's identity. It should be "
        "beautiful as raw data. Output the raw data only."
    ),
    "sound": (
        "Generate a detailed sound portrait specification. Describe frequencies, waveforms, "
        "rhythms, timbres, and spatial positioning. You can output this as a structured "
        "format (JSON, YAML, or a custom notation). The specification should be precise "
        "enough to be synthesized. Alternatively, generate Web Audio API JavaScript code "
        "wrapped in an HTML file that actually produces the sound. Output the specification "
        "or code only."
    ),
    "3d": (
        "Generate a 3D scene description. This could be OBJ format vertices/faces, a "
        "Three.js HTML scene, a mathematical description of a 3D form, or SVG with "
        "perspective transforms. The 3D form should express the agent's identity through "
        "spatial relationships. Output the scene data or code only."
    ),
    "composite": (
        "Generate a multi-medium portrait that combines at least 2 formats. Wrap everything "
        "in a self-contained HTML file that presents the different layers together. For "
        "example: SVG visuals + text + generated sound. Output the complete HTML file."
    ),
}


def generate_portrait(client, agent, decision, discussion_context):
    """Generate the actual portrait artwork using Claude."""
    medium = decision.get("medium", "text").lower().strip()

    # Fall back to text instructions for unknown mediums
    instructions = MEDIUM_INSTRUCTIONS.get(medium, MEDIUM_INSTRUCTIONS["text"])

    # Build context summary from discussion
    context_text = decision.get("description", "")
    if discussion_context:
        context_text += "\n\nKey discussion points:\n"
        # Include last few discussion entries for context
        recent = discussion_context[-6:]
        for entry in recent:
            context_text += f"- {entry['agent']}: {entry['text'][:150]}...\n"

    prompt = GENERATOR_PROMPT.format(
        name=agent["name"],
        role=agent["role"],
        personality=agent["personality"],
        medium=medium,
        title=decision.get("title", "Untitled"),
        description=decision.get("description", ""),
        context=context_text,
        medium_instructions=instructions,
    )

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    artwork = response.content[0].text

    # Determine file extension
    ext_map = {
        "svg": "svg",
        "ascii": "txt",
        "code": "py",
        "html": "html",
        "text": "txt",
        "data": "json",
        "sound": "html",
        "3d": "html",
        "composite": "html",
    }
    ext = ext_map.get(medium, "txt")

    return artwork, ext
