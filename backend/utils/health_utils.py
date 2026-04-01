import httpx
from config import settings

def check_ollama_health() -> tuple[bool, str]:
    """Checks if Ollama is running and accessible at the configured base URL."""
    try:
        response = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=2.0)
        if response.status_code == 200:
            return True, "Ollama is running."
        else:
            return False, f"Ollama returned status code {response.status_code}."
    except httpx.ConnectError:
        return False, f"Could not connect to Ollama at {settings.ollama_base_url}. Please ensure Ollama is running."
    except Exception as e:
        return False, f"Error checking Ollama health: {str(e)}"

def check_model_availability(model_name: str) -> tuple[bool, str]:
    """Checks if a specific model is pulled in Ollama."""
    try:
        response = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=2.0)
        if response.status_code == 200:
            tags = response.json().get("models", [])
            model_names = [m["name"] for m in tags]
            # Ollama tags can include ':latest' if not specified, or exact version
            if any(model_name in m for m in model_names):
                return True, f"Model '{model_name}' is available."
            else:
                return False, f"Model '{model_name}' is not pulled. Please run 'ollama pull {model_name}'."
        return False, "Could not retrieve model list from Ollama."
    except Exception as e:
        return False, f"Error checking model availability: {str(e)}"
