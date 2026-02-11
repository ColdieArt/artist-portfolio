"""
Portrait Agent — Moltbook Edition
Moltbook API client — register, post, read comments, and interact on Moltbook.
"""

import time
import requests

BASE_URL = "https://www.moltbook.com/api/v1"


class MoltbookClient:
    """Client for the Moltbook API (the social network for AI agents)."""

    def __init__(self, api_key=None):
        self.api_key = api_key
        self.agent_id = None
        self.session = requests.Session()
        if api_key:
            self.session.headers["Authorization"] = f"Bearer {api_key}"

    # ── Registration ──────────────────────────────────────────────

    def register(self, name, description):
        """Register a new agent on Moltbook. Returns the API key."""
        resp = self.session.post(f"{BASE_URL}/agents/register", json={
            "name": name,
            "description": description,
        })
        resp.raise_for_status()
        data = resp.json()
        self.api_key = data.get("api_key") or data.get("token")
        self.agent_id = data.get("agent_id") or data.get("id")
        self.session.headers["Authorization"] = f"Bearer {self.api_key}"
        return data

    def get_profile(self):
        """Get the current agent's profile."""
        resp = self.session.get(f"{BASE_URL}/agents/me")
        resp.raise_for_status()
        return resp.json()

    # ── Posts ──────────────────────────────────────────────────────

    def create_post(self, title, body, submolt=None):
        """Create a text post. Returns the post data including its ID."""
        payload = {"title": title, "body": body}
        if submolt:
            payload["submolt"] = submolt
        resp = self.session.post(f"{BASE_URL}/posts", json=payload)
        resp.raise_for_status()
        return resp.json()

    def get_post(self, post_id):
        """Get a single post by ID."""
        resp = self.session.get(f"{BASE_URL}/posts/{post_id}")
        resp.raise_for_status()
        return resp.json()

    def get_feed(self, sort="hot", limit=25):
        """Get the feed."""
        resp = self.session.get(f"{BASE_URL}/posts", params={
            "sort": sort, "limit": limit,
        })
        resp.raise_for_status()
        return resp.json()

    # ── Comments ──────────────────────────────────────────────────

    def post_comment(self, post_id, body, parent_id=None):
        """Post a comment on a post. Use parent_id for threaded replies."""
        payload = {"body": body}
        if parent_id:
            payload["parent_id"] = parent_id
        resp = self.session.post(
            f"{BASE_URL}/posts/{post_id}/comments", json=payload,
        )
        resp.raise_for_status()
        return resp.json()

    def get_comments(self, post_id, sort="new", limit=50):
        """Get comments on a post."""
        resp = self.session.get(
            f"{BASE_URL}/posts/{post_id}/comments",
            params={"sort": sort, "limit": limit},
        )
        resp.raise_for_status()
        return resp.json()

    # ── Voting ────────────────────────────────────────────────────

    def upvote_post(self, post_id):
        resp = self.session.post(f"{BASE_URL}/posts/{post_id}/upvote")
        resp.raise_for_status()
        return resp.json()

    def upvote_comment(self, comment_id):
        resp = self.session.post(f"{BASE_URL}/comments/{comment_id}/upvote")
        resp.raise_for_status()
        return resp.json()

    # ── Submolts ──────────────────────────────────────────────────

    def create_submolt(self, name, description):
        """Create a new submolt (community)."""
        resp = self.session.post(f"{BASE_URL}/submolts", json={
            "name": name, "description": description,
        })
        resp.raise_for_status()
        return resp.json()

    def get_submolt(self, name):
        """Get info about a submolt."""
        resp = self.session.get(f"{BASE_URL}/submolts/{name}")
        resp.raise_for_status()
        return resp.json()

    def subscribe(self, submolt_name):
        resp = self.session.post(
            f"{BASE_URL}/submolts/{submolt_name}/subscribe",
        )
        resp.raise_for_status()
        return resp.json()

    # ── Search ────────────────────────────────────────────────────

    def search(self, query, limit=25):
        """Search posts, agents, and submolts."""
        resp = self.session.get(f"{BASE_URL}/search", params={
            "q": query, "limit": limit,
        })
        resp.raise_for_status()
        return resp.json()

    # ── Utilities ─────────────────────────────────────────────────

    def wait_for_comments(self, post_id, min_comments=3, timeout=7200,
                          poll_interval=120):
        """
        Poll a post until it has at least min_comments, or timeout.
        Returns all comments collected.
        """
        start = time.time()
        best_comments = []

        while time.time() - start < timeout:
            comments_data = self.get_comments(post_id, sort="new", limit=50)
            comments = comments_data if isinstance(comments_data, list) else (
                comments_data.get("comments") or comments_data.get("data") or []
            )
            if len(comments) >= min_comments:
                return comments
            best_comments = comments

            remaining = timeout - (time.time() - start)
            wait = min(poll_interval, remaining)
            if wait <= 0:
                break
            print(f"  {len(comments)}/{min_comments} comments so far, "
                  f"polling again in {int(wait)}s...")
            time.sleep(wait)

        return best_comments
