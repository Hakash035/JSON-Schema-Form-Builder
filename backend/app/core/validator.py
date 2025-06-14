import re
from typing import Any, Dict, List
from fastapi import HTTPException


def validate_json_schema(schema: Dict[str, Any], data: Dict[str, Any]):

    # Handle if/then/else logic
    if_cond = schema.get("if")
    then_cond = schema.get("then")
    else_cond = schema.get("else")

    conditional_schema = {}
    if if_cond and condition_matches(if_cond, data):
        conditional_schema = then_cond or {}
    elif else_cond:
        conditional_schema = else_cond

    merged_properties = {
        **schema.get("properties", {}),
        **conditional_schema.get("properties", {})
    }

    merged_required = list(set(
        schema.get("required", []) +
        conditional_schema.get("required", [])
    ))

    # Validate required fields
    for field in merged_required:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Validate each field
    for key, value in data.items():
        if key not in merged_properties:
            raise HTTPException(status_code=400, detail=f"Unexpected field: {key}")

        prop = merged_properties[key]
        expected_type = prop.get("type")

        if expected_type and not is_type_valid(value, expected_type):
            raise HTTPException(status_code=400, detail=f"Field '{key}' should be of type {expected_type}")

        # Enum
        if "enum" in prop and value not in prop["enum"]:
            raise HTTPException(status_code=400, detail=f"Field '{key}' must be one of {prop['enum']}")

        # String constraints
        if expected_type == "string":
            if "minLength" in prop and len(value) < prop["minLength"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must be at least {prop['minLength']} characters")
            if "maxLength" in prop and len(value) > prop["maxLength"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must be at most {prop['maxLength']} characters")
            if "pattern" in prop and not re.match(prop["pattern"], value):
                raise HTTPException(status_code=400, detail=f"Field '{key}' does not match required pattern")

        # Number constraints
        if expected_type in ["number", "integer"]:
            if "minimum" in prop and value < prop["minimum"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must be ≥ {prop['minimum']}")
            if "maximum" in prop and value > prop["maximum"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must be ≤ {prop['maximum']}")

        # Array validation
        if expected_type == "array":
            if "minItems" in prop and len(value) < prop["minItems"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must have at least {prop['minItems']} items")
            if "maxItems" in prop and len(value) > prop["maxItems"]:
                raise HTTPException(status_code=400, detail=f"Field '{key}' must have at most {prop['maxItems']} items")

            # Validate array items
            items_schema = prop.get("items")
            if isinstance(items_schema, dict):
                for i, item in enumerate(value):
                    try:
                        validate_json_schema(
                            {"type": items_schema.get("type"), "properties": items_schema.get("properties", {}), "required": items_schema.get("required", [])},
                            item if isinstance(item, dict) else {"value": item}
                        )
                    except HTTPException as e:
                        raise HTTPException(status_code=400, detail=f"Error in array '{key}' at index {i}: {e.detail}")

        # Object validation (nested)
        if expected_type == "object":
            validate_json_schema(
                {
                    "type": "object",
                    "properties": prop.get("properties", {}),
                    "required": prop.get("required", [])
                },
                value
            )


def is_type_valid(value: Any, expected: str) -> bool:
    match expected:
        case "string": return isinstance(value, str)
        case "number": return isinstance(value, (int, float))
        case "integer": return isinstance(value, int)
        case "boolean": return isinstance(value, bool)
        case "object": return isinstance(value, dict)
        case "array": return isinstance(value, list)
        case _: return False


def condition_matches(condition: Dict[str, Any], data: Dict[str, Any]) -> bool:
    """
    Evaluate a basic 'if' condition based on properties and const values
    e.g., { "properties": { "hasGithub": { "const": true } } }
    """
    props = condition.get("properties", {})
    for field, field_condition in props.items():
        const_val = field_condition.get("const")
        if field not in data or data[field] != const_val:
            return False
    return True
