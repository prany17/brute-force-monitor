from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50
    )

    email: str = Field(
        min_length=5,
        max_length=100
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True