from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user_schema import UserCreate, UserLogin, UserOut, Token
from app.dependencies import get_db
from app.models.user_model import User
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.services.auth_services import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post('/signup', response_model=UserOut)
def user_create(
    input : UserCreate,
    db : Session = Depends(get_db)
):
    existing_user = db.query(User).filter(input.email == User.email).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="User Already Exists"
        )
    
    hashed_pwd = hash_password(input.password)

    new_user = User(
        full_name = input.full_name,
        email =  input.email,
        hashed_password = hashed_pwd
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post('/login', response_model=Token)
def login(
    current_user : UserLogin ,
    db : Session = Depends(get_db)
):
    user = db.query(User).filter(current_user.email == User.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(current_user.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    access_token = create_access_token(data={"sub" : str(user.id)})

    output = Token(access_token=access_token)
    return output

    