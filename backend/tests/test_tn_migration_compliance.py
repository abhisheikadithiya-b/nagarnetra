import os
import pytest

PROHIBITED_TERMS = [
    "BMTC",
    "BBMP",
    "Bengaluru",
    "Bangalore",
    "KA 01",
    "KA 03",
    "KA 04",
    "KA-01",
    "KA-03",
    "KA-04",
]

# Paths that MUST be 100% clean of Bengaluru/Karnataka coupling in the Tamil Nadu pilot
ACTIVE_CODE_DIRS = [
    "backend/app",
]

def test_no_bengaluru_coupling_in_backend_code():
    violations = []
    for code_dir in ACTIVE_CODE_DIRS:
        for root, _, files in os.walk(code_dir):
            for file in files:
                if file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        for term in PROHIBITED_TERMS:
                            if term.lower() in content.lower():
                                violations.append(f"{file_path}: contains '{term}'")
    
    assert len(violations) == 0, f"Found Bengaluru coupling violations in active backend:\n" + "\n".join(violations)
