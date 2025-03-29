import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { MeetingMessage } from './entities/meeting-message.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { JoinMeetingDto } from './dto/join-meeting.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private participantRepository: Repository<MeetingParticipant>,
    @InjectRepository(MeetingMessage)
    private messageRepository: Repository<MeetingMessage>,
  ) {}

  /**
   * Generate a unique meeting code
   */
  private generateMeetingCode(): string {
    // Generate a 10-character alphanumeric code
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  }

  /**
   * Create a new meeting
   */
  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    const meeting = this.meetingRepository.create({
      ...createMeetingDto,
      startTime: createMeetingDto.isScheduled ? null : new Date(),
      meetingCode: this.generateMeetingCode(),
    });

    return await this.meetingRepository.save(meeting);
  }

  /**
   * Get meeting by ID or code
   */
  async getMeeting(meetingIdOrCode: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: [{ id: meetingIdOrCode }, { meetingCode: meetingIdOrCode }],
      relations: ['participants', 'participants.user'],
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  /**
   * Get all active meetings
   */
  async getActiveMeetings(): Promise<Meeting[]> {
    return await this.meetingRepository.find({
      where: { isActive: true },
      relations: ['participants', 'participants.user', 'host'],
    });
  }

  /**
   * Get meetings hosted by a user
   */
  async getUserMeetings(userId: string): Promise<Meeting[]> {
    return await this.meetingRepository.find({
      where: { hostId: userId },
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Get meetings a user has participated in
   */
  async getUserParticipatedMeetings(userId: string): Promise<Meeting[]> {
    const participations = await this.participantRepository.find({
      where: { userId },
      relations: ['meeting'],
    });

    return participations.map((p) => p.meeting);
  }

  /**
   * Join a meeting
   */
  async joinMeeting(
    joinMeetingDto: JoinMeetingDto,
  ): Promise<MeetingParticipant> {
    const {
      meetingId,
      userId,
      hasCamera = false,
      hasMicrophone = false,
    } = joinMeetingDto;

    // Find the meeting by ID or code
    const meeting = await this.meetingRepository.findOne({
      where: [{ id: meetingId }, { meetingCode: meetingId }],
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (!meeting.isActive) {
      throw new BadRequestException('Meeting is not active');
    }

    // Check if user is already a participant
    let participant = await this.participantRepository.findOne({
      where: {
        meetingId: meeting.id,
        userId,
      },
    });

    if (participant) {
      // If participant exists but is not active, reactivate them
      if (!participant.isActive) {
        participant.isActive = true;
        participant.joinTime = new Date();
        participant.leaveTime = null;
        participant.hasCamera = hasCamera;
        participant.hasMicrophone = hasMicrophone;
        return await this.participantRepository.save(participant);
      }
      return participant;
    }

    // Create new participant
    participant = this.participantRepository.create({
      meetingId: meeting.id,
      userId,
      joinTime: new Date(),
      hasCamera,
      hasMicrophone,
    });

    return await this.participantRepository.save(participant);
  }

  /**
   * Leave a meeting
   */
  async leaveMeeting(meetingId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: {
        meetingId,
        userId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Active participant not found');
    }

    participant.isActive = false;
    participant.leaveTime = new Date();
    await this.participantRepository.save(participant);
  }

  /**
   * End a meeting (host only)
   */
  async endMeeting(meetingId: string, hostId: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: {
        id: meetingId,
        hostId,
        isActive: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException(
        'Active meeting not found or you are not the host',
      );
    }

    meeting.isActive = false;
    meeting.endTime = new Date();

    // Set all participants as inactive
    const participants = await this.participantRepository.find({
      where: {
        meetingId,
        isActive: true,
      },
    });

    for (const participant of participants) {
      participant.isActive = false;
      participant.leaveTime = new Date();
      await this.participantRepository.save(participant);
    }

    return await this.meetingRepository.save(meeting);
  }

  /**
   * Update participant status (camera, microphone, screen sharing)
   */
  async updateParticipantStatus(
    updateDto: UpdateParticipantStatusDto,
  ): Promise<MeetingParticipant> {
    const { meetingId, userId, hasCamera, hasMicrophone, isScreenSharing } =
      updateDto;

    const participant = await this.participantRepository.findOne({
      where: {
        meetingId,
        userId,
        isActive: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Active participant not found');
    }

    participant.hasCamera = hasCamera;
    participant.hasMicrophone = hasMicrophone;
    participant.isScreenSharing = isScreenSharing;

    return await this.participantRepository.save(participant);
  }

  /**
   * Send a message in the meeting
   */
  async sendMessage(sendMessageDto: SendMessageDto): Promise<MeetingMessage> {
    const {
      meetingId,
      senderId,
      message,
      isPrivate = false,
      receiverId,
    } = sendMessageDto;

    // Validate meeting exists and is active
    const meeting = await this.meetingRepository.findOne({
      where: {
        id: meetingId,
        isActive: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Active meeting not found');
    }

    // Validate sender is a participant
    const sender = await this.participantRepository.findOne({
      where: {
        meetingId,
        userId: senderId,
        isActive: true,
      },
    });

    if (!sender) {
      throw new BadRequestException(
        'Sender is not an active participant in this meeting',
      );
    }

    // If private message, validate receiver is a participant
    if (isPrivate && receiverId) {
      const receiver = await this.participantRepository.findOne({
        where: {
          meetingId,
          userId: receiverId,
          isActive: true,
        },
      });

      if (!receiver) {
        throw new BadRequestException(
          'Receiver is not an active participant in this meeting',
        );
      }
    }

    // Create and save message
    const newMessage = this.messageRepository.create({
      meetingId,
      senderId,
      message,
      timestamp: new Date(),
      isPrivate,
      receiverId: isPrivate ? receiverId : null,
    });

    return await this.messageRepository.save(newMessage);
  }

  /**
   * Get meeting messages
   */
  async getMeetingMessages(
    meetingId: string,
    userId: string,
  ): Promise<MeetingMessage[]> {
    // Validate user is a participant
    const participant = await this.participantRepository.findOne({
      where: {
        meetingId,
        userId,
      },
    });

    if (!participant) {
      throw new BadRequestException(
        'User is not a participant in this meeting',
      );
    }

    // Get public messages and private messages for this user
    return await this.messageRepository.find({
      where: [
        { meetingId, isPrivate: false },
        { meetingId, isPrivate: true, senderId: userId },
        { meetingId, isPrivate: true, receiverId: userId },
      ],
      order: { timestamp: 'ASC' },
      relations: ['sender'],
    });
  }
}
