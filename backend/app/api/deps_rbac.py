from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user, get_db
from app.models.user import User

def check_role(user: User, required_roles: list):
    if user.role not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Mission Control Authority required. Expected {required_roles}, but found {user.role}."
        )
    return user

def get_current_admin(user: User = Depends(get_current_active_user)):
    return check_role(user, ["ADMIN"])

def get_current_operator(user: User = Depends(get_current_active_user)):
    return check_role(user, ["ADMIN", "OPERATOR"])

def get_current_viewer(user: User = Depends(get_current_active_user)):
    return check_role(user, ["ADMIN", "OPERATOR", "VIEWER"])

def restrict_to_project(db_query, user: User, model=None):
    """
    Filter query by tenant scope with backward-compatible fallback.

    - ADMIN sees all rows.
    - If the target model has `project_id`, scope to user's project.
    - If project scoping is unavailable but `user_id` exists, scope to current user.
    """
    if user.role == "ADMIN":
        return db_query

    target_model = model
    if target_model is None and getattr(db_query, "column_descriptions", None):
        first_entity = db_query.column_descriptions[0].get("entity")
        target_model = first_entity

    if target_model is None:
        return db_query

    if hasattr(target_model, "project_id"):
        if user.project_id is None:
            return db_query.filter(False)
        return db_query.filter(getattr(target_model, "project_id") == user.project_id)

    if hasattr(target_model, "user_id"):
        return db_query.filter(getattr(target_model, "user_id") == user.id)

    return db_query

def restrict_to_authorized_accounts(db_query, user: User, model=None):
    """
    Filter query to only include resources/accounts the user is authorized for.
    """
    if user.role == "ADMIN":
        return db_query
        
    target_model = model
    if target_model is None and getattr(db_query, "column_descriptions", None):
        target_model = db_query.column_descriptions[0].get("entity")

    if target_model is None:
        return db_query

    # If the model is CloudAccount itself
    from app.models.cloud_account import CloudAccount
    if target_model == CloudAccount:
        return db_query.filter(CloudAccount.authorized_users.any(id=user.id))

    # If the model has a cloud_account_id
    if hasattr(target_model, "cloud_account_id"):
        return db_query.join(CloudAccount).filter(CloudAccount.authorized_users.any(id=user.id))

    return restrict_to_project(db_query, user, model)

def get_account_operator(account_id: int, user: User = Depends(get_current_operator), db: Session = Depends(get_db)):
    """ Verify the user is authorized for a specific mission boundary (account). """
    if user.role == "ADMIN":
        return user
        
    from app.models.cloud_account import CloudAccount
    is_auth = db.query(CloudAccount).filter(
        CloudAccount.id == account_id,
        CloudAccount.authorized_users.any(id=user.id)
    ).first()
    
    if not is_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Strategic mission failure: You are not authorized for this cloud boundary."
        )
    return user
