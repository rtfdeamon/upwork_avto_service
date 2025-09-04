import os
import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Enum, DateTime, Text, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserRole(str, enum.Enum):
    OWNER = 'OWNER'
    SDR = 'SDR'
    VIEWER = 'VIEWER'


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    PAST_DUE = 'PAST_DUE'


class ProposalStatus(str, enum.Enum):
    DRAFT = 'DRAFT'
    SENT = 'SENT'
    ERROR = 'ERROR'


class ProposalFeedback(str, enum.Enum):
    UP = 'UP'
    DOWN = 'DOWN'


def uuid_pk():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = 'user'
    id = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    email = Column(String, unique=True, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.OWNER, nullable=False)
    hashedPw = Column(String, nullable=False)
    subscription = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False)
    createdAt = Column(DateTime(timezone=True), default=datetime.utcnow)

    apiKeys = relationship('ApiKey', back_populates='user')


class ApiKey(Base):
    __tablename__ = 'api_key'
    id = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    userId = Column(UUID(as_uuid=False), ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    upworkKey = Column(String, nullable=False)
    upworkSecret = Column(String, nullable=False)
    refreshToken = Column(String, nullable=True)
    expiresAt = Column(DateTime(timezone=True), nullable=True)
    alias = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship('User', back_populates='apiKeys')


class Proposal(Base):
    __tablename__ = 'proposal'
    id = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    userId = Column(UUID(as_uuid=False), ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    apiKeyId = Column(UUID(as_uuid=False), ForeignKey('api_key.id', ondelete='SET NULL'), nullable=True)
    jobId = Column(String, nullable=False)
    jobTitle = Column(String, nullable=True)
    draft = Column(Text, nullable=False)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.DRAFT, nullable=False)
    feedback = Column(Enum(ProposalFeedback), nullable=True)
    sentAt = Column(DateTime(timezone=True), nullable=True)
    createdAt = Column(DateTime(timezone=True), default=datetime.utcnow)


class RuleSet(Base):
    __tablename__ = 'rule_set'
    id = Column(UUID(as_uuid=False), primary_key=True, default=uuid_pk)
    userId = Column(UUID(as_uuid=False), ForeignKey('user.id', ondelete='CASCADE'), nullable=True)
    name = Column(String, nullable=False)
    jsonLogic = Column(Text, nullable=False)
    createdAt = Column(DateTime(timezone=True), default=datetime.utcnow)
