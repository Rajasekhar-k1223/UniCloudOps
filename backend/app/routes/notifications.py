from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api.deps_rbac import get_current_viewer, restrict_to_project

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
def get_notifications(
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db),
    unread_only: bool = False
):
    """Fetch tactical alerts within the user's sovereign project boundary."""
    query = db.query(Notification)
    query = restrict_to_project(query, current_user)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
        
    return query.order_by(Notification.created_at.desc()).limit(50).all()

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db)
):
    """Retrieve current unread alert telemetry count."""
    query = db.query(Notification).filter(Notification.is_read == False)
    return {"count": restrict_to_project(query, current_user).count()}

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db)
):
    """Acknowledge an alert and mark as read."""
    query = db.query(Notification).filter(Notification.id == notification_id)
    notification = restrict_to_project(query, current_user).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Tactical alert not found in sovereign boundary")
    
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db)
):
    """Bulk acknowledge all unread tactical alerts for the active project."""
    query = db.query(Notification).filter(Notification.is_read == False)
    unread_notifs = restrict_to_project(query, current_user).all()
    
    for n in unread_notifs:
        n.is_read = True
    
    db.commit()
    return {"status": "success", "count": len(unread_notifs)}
