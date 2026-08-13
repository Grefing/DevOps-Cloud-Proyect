"""
OpsWatch load test — CRUD + health against the backend API.

Set host via Locust CLI (--host) or TARGET_HOST in docker-compose.
"""

import random
import string

from locust import HttpUser, between, task

STATUSES = ["healthy", "down", "unknown"]
LOAD_TEST_PREFIX = "locust-"


def _random_suffix(length: int = 10) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(random.choices(alphabet, k=length))


class OpsWatchUser(HttpUser):
    """Simulates users performing read/write operations on OpsWatch."""

    wait_time = between(0.2, 1.0)

    def on_start(self) -> None:
        self.created_ids: list[int] = []

    @task(5)
    def list_services(self) -> None:
        self.client.get("/api/services", name="GET /api/services")

    @task(3)
    def create_service(self) -> None:
        suffix = _random_suffix()
        with self.client.post(
            "/api/services",
            json={
                "name": f"{LOAD_TEST_PREFIX}{suffix}",
                "url": f"https://example.com/services/{suffix}",
                "status": random.choice(STATUSES),
            },
            catch_response=True,
            name="POST /api/services",
        ) as response:
            if response.status_code == 201:
                service_id = response.json().get("id")
                if isinstance(service_id, int):
                    self.created_ids.append(service_id)
                    if len(self.created_ids) > 100:
                        self.created_ids.pop(0)
            else:
                response.failure(f"expected 201, got {response.status_code}")

    @task(2)
    def get_service_by_id(self) -> None:
        service_id = self._pick_service_id()
        if service_id is None:
            return
        self.client.get(
            f"/api/services/{service_id}",
            name="GET /api/services/:id",
        )

    @task(2)
    def update_service(self) -> None:
        service_id = self._pick_service_id()
        if service_id is None:
            return
        self.client.put(
            f"/api/services/{service_id}",
            json={"status": random.choice(STATUSES)},
            name="PUT /api/services/:id",
        )

    @task(1)
    def delete_service(self) -> None:
        service_id = None
        if self.created_ids:
            service_id = self.created_ids.pop()
        else:
            service_id = self._pick_service_id_from_list(
                name_prefix=LOAD_TEST_PREFIX
            )

        if service_id is None:
            return

        self.client.delete(
            f"/api/services/{service_id}",
            name="DELETE /api/services/:id",
        )

    @task(2)
    def health(self) -> None:
        self.client.get("/health", name="GET /health")

    def _pick_service_id(self) -> int | None:
        if self.created_ids:
            return random.choice(self.created_ids)
        return self._pick_service_id_from_list()

    def _pick_service_id_from_list(
        self, name_prefix: str | None = None
    ) -> int | None:
        with self.client.get(
            "/api/services",
            catch_response=True,
            name="GET /api/services (pick id)",
        ) as response:
            if response.status_code != 200:
                response.failure(f"expected 200, got {response.status_code}")
                return None

            services = response.json()
            if not isinstance(services, list) or len(services) == 0:
                return None

            if name_prefix:
                filtered = [
                    s for s in services
                    if isinstance(s.get("name"), str)
                    and s["name"].startswith(name_prefix)
                ]
                if filtered:
                    return random.choice(filtered)["id"]

            return random.choice(services)["id"]
